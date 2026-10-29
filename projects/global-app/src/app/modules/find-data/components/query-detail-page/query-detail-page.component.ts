import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {toSignal} from "@angular/core/rxjs-interop";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatTabsModule} from "@angular/material/tabs";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {StatusBadeType} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {QueryConfig} from '@global-app/find-data/models';
import {Lang2Group} from '@global-app/find-data/dto/lang2-query';
import {CreateQueryDTO, QueryDetailDTO, QueryDTO} from "@global-app/find-data/dto/query";
import {
  QueryBuilderGroupComponent
} from "@global-app/find-data/components/query-builder-group/query-builder-group.component";
import {
  createEmptyGroup,
  QueryGroupNode,
  QueryLeafNode,
  QueryNode,
  RelationKind,
  TemporalRelationDraft,
} from '@global-app/find-data/models/query-tree';
import {describeQueryLeaf, formatInterval, hydrateQueryTree, serializeQueryTree} from '@global-app/find-data/helpers/query-tree.serializer';
import {relationNeedsInterval} from '@global-app/find-data/helpers/query-tree.rules';
import {isQueryTreeValid} from '@global-app/find-data/helpers/query-tree.validator';
import {QueryService} from "@global-app/find-data/services/query.service";
import {QueryJsonPreviewComponent} from '@global-app/find-data/components/query-json-preview/query-json-preview.component';
import {
  QueryStatisticsPanelComponent
} from "@global-app/find-data/components/query-statistics-panel/query-statistics-panel.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {startWith} from "rxjs/operators";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

type QueryDetailTab = 'overview' | 'builder' | 'versions' | 'statistics';

@Component({
  selector: 'app-query-detail-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    TranslatePipe,
    BadgeComponent,
    HeaderComponent,
    TimeBadgeComponent,
    QueryBuilderGroupComponent,
    QueryJsonPreviewComponent,
    QueryStatisticsPanelComponent,
    PageWrapperComponent,
    BtnComponent
  ],
  templateUrl: './query-detail-page.component.html',
  styleUrl: './query-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly queryService = inject(QueryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly query = signal<QueryDetailDTO | null>(null);
  readonly queryConfigs = signal<QueryConfig[]>([]);
  readonly pageError = signal<string | null>(null);
  readonly selectedTab = signal<QueryDetailTab>('overview');
  readonly isBusy = signal(false);
  readonly olderQueries = computed<QueryDTO[]>(() =>
    [...(this.query()?.olderQueries ?? [])].sort((left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )
  );
  readonly hasVersionsTab = computed(() => this.olderQueries().length > 0);
  readonly versionViews = computed(() => {
    const queries = this.olderQueries();
    const configs = this.queryConfigs();
    const unknown = this.translate.instant('QUERY_BUILDER.UNKNOWN_VARIABLE');
    return queries.map((query, index) => ({
      query,
      sequence: queries.length - index,
      outline: outlineQuery(query.query, configs, unknown),
    }));
  });
  readonly hasStatisticsTab = computed(() => !!this.query()?.latestDataStatisticsRequest);
  readonly currentOutline = computed(() => {
    const current = this.query();
    if (!current) {
      return null;
    }
    return outlineQuery(
      current.query,
      this.queryConfigs(),
      this.translate.instant('QUERY_BUILDER.UNKNOWN_VARIABLE'),
    );
  });

  queryRoot: QueryGroupNode = createEmptyGroup();
  queryDetailForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });
  readonly queryListChangeTick = signal(0);
  readonly treeValid = computed(() => {
    this.queryListChangeTick();
    return isQueryTreeValid(this.queryRoot);
  });
  readonly formValue = toSignal(
    this.queryDetailForm.valueChanges.pipe(startWith(this.queryDetailForm.getRawValue())),
    {initialValue: this.queryDetailForm.getRawValue()}
  );

  readonly showJson = signal(false);
  readonly requestPreview = computed(() => {
    this.queryListChangeTick();
    const formValue = this.formValue();
    return {
      name: formValue.name ?? '',
      description: formValue.description ?? '',
      query: serializeQueryTree(this.queryRoot),
    };
  });

  readonly hasChanges = computed(() => {
    const currentQuery = this.query();
    if (!currentQuery) {
      return false;
    }

    this.queryListChangeTick();
    const formValue = this.formValue();
    const savedQuery = serializeQueryTree(hydrateQueryTree(currentQuery.query, this.queryConfigs()));
    return currentQuery.name !== (formValue.name ?? '')
      || currentQuery.description !== (formValue.description ?? '')
      || JSON.stringify(savedQuery) !== JSON.stringify(serializeQueryTree(this.queryRoot));
  });

  ngOnInit(): void {
    this.route.data.subscribe(({query, queryConfigs}) => {
      if (!query) {
        this.pageError.set('Query not found');
        return;
      }

      this.queryConfigs.set(queryConfigs ?? []);
      this.hydratePage(query);
      this.syncSelectedTab(this.route.snapshot.fragment);
    });

    this.route.fragment.subscribe(fragment => {
      this.syncSelectedTab(fragment);
    });
  }

  isQueryRunning(query: QueryDTO | null = this.query()): boolean {
    if (!query) {
      return false;
    }
    return !query.hasResult && query.hasFired;
  }

  getQueryStatusType(query: QueryDTO | null = this.query()): StatusBadeType {
    if (!query) {
      return 'INIT';
    }
    if (query.hasResult) {
      return 'SUCCESS';
    }
    if (query.hasFired) {
      return 'RUNNING';
    }
    return 'INIT';
  }

  getQueryStatusText(query: QueryDTO | null = this.query()): string {
    if (!query) {
      return 'Unknown';
    }
    if (query.hasResult) {
      return 'Completed';
    }
    if (query.hasFired) {
      return 'Running';
    }
    return 'Draft';
  }

  onQueryChange(group: QueryGroupNode): void {
    this.queryRoot = group;
    this.markQueryListChanged();
  }

  saveQuery(): void {
    const currentQuery = this.query();
    if (!currentQuery || this.isInvalid() || !this.hasChanges()) {
      return;
    }

    this.isBusy.set(true);
    if (currentQuery.hasFired && this.hasChanges()) {
      this.queryService.createQuery(this.buildCreateDto(currentQuery)).subscribe({
        next: (query) => this.navigateToQuery(query, 'Query saved as a new draft'),
        error: () => this.isBusy.set(false)
      });
      return;
    }

    this.queryService.updateQuery(this.buildUpdateDto(currentQuery)).subscribe({
      next: (query) => this.applyQueryUpdate(query, 'Query updated'),
      error: () => this.isBusy.set(false)
    });
  }

  saveAndRunQuery(): void {
    const currentQuery = this.query();
    if (!currentQuery || this.isInvalid()) {
      return;
    }

    this.isBusy.set(true);
    if (currentQuery.hasFired && this.hasChanges()) {
      this.queryService.createAndRunQuery(this.buildCreateDto(currentQuery)).subscribe({
        next: (query) => this.navigateToQuery(query, this.translate.instant('QUERY_FIRED')),
        error: () => this.isBusy.set(false)
      });
      return;
    }

    if (!currentQuery.hasFired && this.hasChanges()) {
      this.queryService.updateQuery(this.buildUpdateDto(currentQuery)).subscribe({
        next: (query) => {
          this.queryService.fireQuery(query.id).subscribe({
            next: (firedQuery) => this.applyQueryUpdate(firedQuery, this.translate.instant('QUERY_FIRED')),
            error: () => this.isBusy.set(false)
          });
        },
        error: () => this.isBusy.set(false)
      });
      return;
    }

    this.queryService.fireQuery(currentQuery.id).subscribe({
      next: (query) => {
        if (query.id !== currentQuery.id) {
          this.navigateToQuery(query, this.translate.instant('QUERY_FIRED'));
          return;
        }
        this.refreshQueryDetail(query.id, this.translate.instant('QUERY_FIRED'));
      },
      error: () => this.isBusy.set(false)
    });
  }

  requestStatistics(): void {
    const currentQuery = this.query();
    if (!currentQuery) {
      return;
    }

    this.isBusy.set(true);
    this.queryService.fireDataStatistics(currentQuery.id).subscribe({
      next: (query) => {
        this.refreshQueryDetail(
          query.id,
          currentQuery.latestDataStatisticsRequest
            ? this.translate.instant('DATA_STATISTICS_REREQUESTED')
            : this.translate.instant('DATA_STATISTICS_REQUESTED'),
          'statistics'
        );
      },
      error: () => this.isBusy.set(false)
    });
  }

  goBack(): void {
    this.router.navigate(['/find-data']);
  }

  setSelectedTab(tab: QueryDetailTab): void {
    this.selectedTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      fragment: tab,
      replaceUrl: true,
    });
  }

  getTabFromHash(hash: string | null): QueryDetailTab {
    switch (hash) {
      case 'builder':
        return 'builder';
      case 'versions':
        return this.hasVersionsTab() ? 'versions' : 'overview';
      case 'statistics':
        return this.hasStatisticsTab() ? 'statistics' : 'overview';
      case 'overview':
      default:
        return 'overview';
    }
  }

  getQueryStatusBadgeColor(query: QueryDTO): 'GREEN' | 'BLUE' | 'GRAY' {
    if (query.hasResult) {
      return 'GREEN';
    }
    if (query.hasFired) {
      return 'BLUE';
    }
    return 'GRAY';
  }

  private buildCreateDto(currentQuery?: QueryDTO): CreateQueryDTO {
    const value = this.queryDetailForm.getRawValue();
    return {
      name: value.name ?? '',
      description: value.description ?? '',
      query: serializeQueryTree(this.queryRoot),
      groupId: currentQuery?.groupId,
    };
  }

  private buildUpdateDto(currentQuery: QueryDTO): QueryDTO {
    const value = this.queryDetailForm.getRawValue();
    return {
      ...currentQuery,
      name: value.name ?? '',
      description: value.description ?? '',
      query: currentQuery.hasFired && this.hasChanges() ? currentQuery.query : serializeQueryTree(this.queryRoot),
    };
  }

  private applyQueryUpdate(query: QueryDTO, message: string): void {
    this.refreshQueryDetail(query.id, message);
  }

  private navigateToQuery(query: QueryDTO, message: string): void {
    this.isBusy.set(false);
    this.snackBar.open(message, this.translate.instant('BUTTON.CLOSE'), {duration: 4000});
    this.router.navigate(['/find-data', query.id], {fragment: this.selectedTab()});
  }

  private isInvalid(): boolean {
    this.queryDetailForm.markAllAsTouched();
    return this.queryDetailForm.invalid || !isQueryTreeValid(this.queryRoot);
  }

  private hydratePage(query: QueryDetailDTO): void {
    this.pageError.set(null);
    this.query.set(query);
    this.queryRoot = hydrateQueryTree(query.query, this.queryConfigs());
    this.markQueryListChanged();
    this.queryDetailForm.patchValue({
      name: query.name,
      description: query.description,
    });
    this.queryDetailForm.markAsPristine();
  }

  private syncSelectedTab(fragment: string | null): void {
    this.selectedTab.set(this.getTabFromHash(fragment));
  }

  private refreshQueryDetail(queryId: number, message: string, nextTab?: QueryDetailTab): void {
    this.queryService.get(queryId).subscribe({
      next: (query) => {
        this.hydratePage(query);
        if (nextTab) {
          this.setSelectedTab(this.getTabFromHash(nextTab));
        } else {
          this.syncSelectedTab(this.route.snapshot.fragment);
        }
        this.isBusy.set(false);
        this.snackBar.open(message, this.translate.instant('BUTTON.CLOSE'), {duration: 4000});
      },
      error: () => this.isBusy.set(false)
    });
  }

  private markQueryListChanged(): void {
    this.queryListChangeTick.update(value => value + 1);
  }
}

interface VersionLeafView {
  kind: 'leaf';
  name: string;
  detail: string;
}

interface VersionGroupView {
  kind: 'group';
  connector: 'AND' | 'OR';
  children: VersionNodeView[];
  relations: string[];
}

type VersionNodeView = VersionLeafView | VersionGroupView;

const RELATION_TEXT: Record<RelationKind, string> = {
  within: 'within',
  in_the_following: 'in the following',
  same_time: 'same time',
  anytime_after: 'anytime after',
  same_visit: 'same visit',
  same_group: 'same group',
};

function outlineQuery(query: Lang2Group, configs: QueryConfig[], unknown: string): VersionGroupView {
  return outlineGroup(hydrateQueryTree(query, configs), unknown);
}

function outlineGroup(group: QueryGroupNode, unknown: string): VersionGroupView {
  return {
    kind: 'group',
    connector: group.connectingOperator === '$or' ? 'OR' : 'AND',
    children: group.children.map(child => outlineNode(child, unknown)),
    relations: group.relations.map(relation => outlineRelation(group, relation, unknown)),
  };
}

function outlineNode(node: QueryNode, unknown: string): VersionNodeView {
  return node.kind === 'group' ? outlineGroup(node, unknown) : outlineLeaf(node, unknown);
}

function outlineLeaf(leaf: QueryLeafNode, unknown: string): VersionLeafView {
  const name = leaf.catalogName || unknown;
  const sentence = describeQueryLeaf(leaf, () => name);
  const prefix = `${name} `;
  return {
    kind: 'leaf',
    name,
    detail: sentence.startsWith(prefix) ? sentence.slice(prefix.length) : '',
  };
}

function outlineRelation(group: QueryGroupNode, relation: TemporalRelationDraft, unknown: string): string {
  const source = endpointName(group.children[relation.source ?? -1], unknown);
  const target = endpointName(group.children[relation.target ?? -1], unknown);
  const interval = relationNeedsInterval(relation.kind) ? formatInterval(relation.interval) : '';
  const phrase = interval ? `${RELATION_TEXT[relation.kind]} ${interval}` : RELATION_TEXT[relation.kind];
  const bounds = [
    relation.atLeast !== null ? `at least ${relation.atLeast}` : '',
    relation.atMost !== null ? `at most ${relation.atMost}` : '',
  ].filter(Boolean);
  const suffix = bounds.length ? ` (${bounds.join(', ')})` : '';
  return `${source} · ${phrase} · ${target}${suffix}`;
}

function endpointName(node: QueryNode | undefined, unknown: string): string {
  if (!node) {
    return '?';
  }
  if (node.kind === 'leaf') {
    return node.catalogName || unknown;
  }
  return node.connectingOperator === '$or' ? 'OR' : 'AND';
}

import {ChangeDetectionStrategy, Component, computed, forwardRef, input, output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {QueryConfig} from '@global-app/find-data/models';
import {describeQueryGroup} from '@global-app/find-data/helpers/query-tree.serializer';
import {relationNeedsInterval} from '@global-app/find-data/helpers/query-tree.rules';
import {
  canAddRelation,
  cloneQueryNode,
  countLeaves,
  createEmptyGroup,
  createEmptyLeaf,
  createRelation,
  insertChild,
  moveChild,
  QueryGroupNode,
  QueryLeafNode,
  QueryNode,
  RelationKind,
  removeChild,
  TemporalRelationDraft,
  updateChild,
} from '@global-app/find-data/models/query-tree';
import {QueryBuilderItemComponent} from '@global-app/find-data/components/query-builder-item/query-builder-item.component';
import {QueryIntervalFieldComponent} from '@global-app/find-data/components/query-interval-field/query-interval-field.component';

@Component({
  selector: 'app-query-builder-group',
  imports: [
    forwardRef(() => QueryBuilderGroupComponent),
    QueryBuilderItemComponent,
    QueryIntervalFieldComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  templateUrl: './query-builder-group.component.html',
  styleUrl: './query-builder-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryBuilderGroupComponent {
  readonly group = input.required<QueryGroupNode>();
  readonly queryConfigs = input<QueryConfig[]>([]);
  readonly level = input(0);
  readonly numberPrefix = input('');
  readonly isRoot = input(true);
  readonly isFirst = input(false);
  readonly isLast = input(false);

  readonly groupChange = output<QueryGroupNode>();
  readonly remove = output<void>();
  readonly duplicate = output<void>();
  readonly moveUp = output<void>();
  readonly moveDown = output<void>();

  readonly relationKinds: RelationKind[] = [
    'within',
    'in_the_following',
    'same_time',
    'anytime_after',
    'same_visit',
    'same_group',
  ];

  readonly leafCount = computed(() => countLeaves(this.group()));
  readonly queryText = computed(() => describeQueryGroup(this.group(), leaf => {
    const config = this.queryConfigs().find(item =>
      item.ontology.id === leaf.ontologyId && item.dataType.id === leaf.dataTypeId
    );
    return config?.name || leaf.catalogName || leaf.ontologyId || '…';
  }));
  readonly allowRelation = computed(() => canAddRelation(this.group()));
  readonly leafChoices = computed(() => this.group().children.flatMap((child, index) => {
    if (child.kind !== 'leaf' || child.valueAggregation === 'average') {
      return [];
    }
    const name = child.catalogName || child.ontologyId || '…';
    return [{index, label: `${this.childLabel(index)} · ${name}`}];
  }));

  childLabel(index: number): string {
    const prefix = this.numberPrefix();
    return prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
  }

  isGroup(node: QueryNode): node is QueryGroupNode {
    return node.kind === 'group';
  }

  asLeaf(node: QueryNode): QueryLeafNode {
    return node as QueryLeafNode;
  }

  needsInterval(kind: RelationKind): boolean {
    return relationNeedsInterval(kind);
  }

  setOperator(operator: '$and' | '$or'): void {
    this.groupChange.emit({...this.group(), connectingOperator: operator});
  }

  toggleCollapsed(): void {
    this.groupChange.emit({...this.group(), collapsed: !this.group().collapsed});
  }

  expand(): void {
    if (this.group().collapsed) {
      this.groupChange.emit({...this.group(), collapsed: false});
    }
  }

  addLeaf(): void {
    this.groupChange.emit({
      ...insertChild(this.group(), this.group().children.length, createEmptyLeaf()),
      collapsed: false,
    });
  }

  addGroup(): void {
    this.groupChange.emit({
      ...insertChild(this.group(), this.group().children.length, createEmptyGroup()),
      collapsed: false,
    });
  }

  addRelation(): void {
    this.groupChange.emit({
      ...this.group(),
      collapsed: false,
      relations: [...this.group().relations, createRelation(this.group())],
    });
  }

  onLeafChange(index: number, leaf: QueryLeafNode): void {
    this.groupChange.emit(updateChild(this.group(), index, leaf));
  }

  onGroupChange(index: number, group: QueryGroupNode): void {
    this.groupChange.emit(updateChild(this.group(), index, group));
  }

  duplicateChild(index: number): void {
    const child = this.group().children[index];
    this.groupChange.emit(insertChild(this.group(), index + 1, cloneQueryNode(child)));
  }

  removeChildAt(index: number): void {
    this.groupChange.emit(removeChild(this.group(), index));
  }

  move(index: number, direction: -1 | 1): void {
    this.groupChange.emit(moveChild(this.group(), index, direction));
  }

  updateRelation(index: number, patch: Partial<TemporalRelationDraft>): void {
    const relations = this.group().relations.map((relation, relationIndex) => {
      if (relationIndex !== index) {
        return relation;
      }
      const next = {...relation, ...patch};
      if (patch.kind && !relationNeedsInterval(patch.kind)) {
        next.interval = [];
      }
      return next;
    });
    this.groupChange.emit({...this.group(), relations});
  }

  removeRelation(index: number): void {
    this.groupChange.emit({
      ...this.group(),
      relations: this.group().relations.filter((_, relationIndex) => relationIndex !== index),
    });
  }

  optionalCount(value: string): number | null {
    if (value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}

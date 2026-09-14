import {Component, effect, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatTabsModule} from "@angular/material/tabs";
import {WorkflowViewComponent} from "@shared-lib/modules/workflow/components/workflow-view/workflow-view.component";
import {
  ProjectRunsComponent
} from "@global-app/project/components/detail-project/components/project-runs/project-runs.component";
import {TranslatePipe} from "@ngx-translate/core";
import {
  DetailProjectOverviewComponent
} from "@global-app/project/components/detail-project/components/detail-project-overview/detail-project-overview.component";
import {
  CreateDatasetsComponent
} from "@global-app/project/components/detail-project/components/create-datasets/create-datasets.component";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {Store} from "@ngrx/store";
import {selectError, selectLoading, selectSelectedProject} from "@global-app/project/store/project.selectors";
import {selectSelectedWorkflow} from "@shared-lib/modules/workflow/store/workflow.selectors";
import * as WorkflowActions from '@shared-lib/modules/workflow/store/workflow.actions';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {QueryService} from "@global-app/find-data/services/query.service";
import {QueryDetailDTO} from "@global-app/find-data/dto/query";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

@Component({
  selector: 'app-detail-project',
  templateUrl: './detail-project.component.html',
  styleUrl: './detail-project.component.scss',
  imports: [
    MatTabsModule,
    WorkflowViewComponent,
    ProjectRunsComponent,
    TranslatePipe,
    DetailProjectOverviewComponent,
    CreateDatasetsComponent,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    BadgeComponent
  ]
})
export class DetailProjectComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly queryService: QueryService = inject(QueryService);

  selectedIndex = signal<number>(0);

  project = this.store.selectSignal(selectSelectedProject);
  loading = this.store.selectSignal(selectLoading);
  error = this.store.selectSignal(selectError);
  query = signal<QueryDetailDTO | undefined>(undefined);
  workflow = signal<WorkflowDTO | undefined>(undefined);
  flDummyPreview = signal<Record<string, unknown>[]>([]);

  private readonly selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);

  constructor() {
    effect(() => {
      const p = this.project();
      this.store.dispatch(WorkflowActions.clearSelectedWorkflow());
      if (p?.workflowId) {
        this.store.dispatch(WorkflowActions.loadWorkflow({id: p.workflowId}));
      }
      if (p?.queryId) {
        this.queryService.get(p?.queryId).subscribe(query => this.query.set(query));
      }
    });
    effect(() => {
      const wf = this.selectedWorkflow();
      this.workflow.set(wf ? {...wf} : undefined);
    });
  }

  ngOnInit(): void {
    this.activatedRoute.fragment.subscribe(fragment => {
      const tabIndex = this.getTabIndexFromHash(fragment);
      if (tabIndex !== -1) {
        this.selectedIndex.set(tabIndex);
      }
    });
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex.set(index);
    const fragments = ['overview', 'data', 'workflow', 'run'];
    this.router.navigate([], {fragment: fragments[index]});
  }

  getTabIndexFromHash(hash: string | null): number {
    switch (hash) {
      case 'overview':
        return 0;
      case 'data':
        return 1;
      case 'workflow':
        return 2;
      case 'run':
        return 3;
      case 'bootstrap':
        return 4;
      default:
        return 0;
    }
  }

}

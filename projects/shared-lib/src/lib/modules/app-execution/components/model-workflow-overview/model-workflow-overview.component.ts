import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatToolbarModule} from "@angular/material/toolbar";
import {RouterLink} from "@angular/router";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {Store} from "@ngrx/store";
import {MatDialog} from "@angular/material/dialog";
import {ModelWorkflowDTO} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {
  CreateModelWorkflowDialogComponent
} from "@shared-lib/modules/app-execution/components/create-model-workflow-dialog/create-model-workflow-dialog.component";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {
  selectAllDataAnalyses,
  selectError,
  selectLoading
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

@Component({
  selector: 'lib-model-workflow-overview',
  imports: [
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatToolbarModule,
    RouterLink,
    MatMenuModule,
    HeaderComponent,
    EmptyStateComponent,
    PageWrapperComponent
  ],
  templateUrl: './model-workflow-overview.component.html',
  styleUrl: './model-workflow-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelWorkflowOverviewComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);

  displayedColumns: string[] = ['name', 'actions'];

  workflows = this.store.selectSignal(selectAllDataAnalyses);
  loading = this.store.selectSignal(selectLoading);
  error = this.store.selectSignal(selectError);

  isEmpty = computed(() => this.workflows()?.length === 0);

  createModelWorkflow(): void {
    this.dialog.open(CreateModelWorkflowDialogComponent, {});
  }

  deleteModelWorkflow(workflow: ModelWorkflowDTO): void {
    this.store.dispatch(DataAnalysisActions.deleteDataAnalysis({id: workflow.id}));
  }
}

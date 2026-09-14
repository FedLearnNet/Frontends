import {Component, computed, effect, inject, input} from '@angular/core';
import {Store} from "@ngrx/store";
import {listWorkflowForApp, listWorkflows} from "@shared-lib/modules/workflow/store/workflow.actions";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {selectWorkflows, selectWorkflowsForApp} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {
  WorkflowOverviewCardComponent
} from "@shared-lib/modules/workflow/components/workflow-overview-card/workflow-overview-card.component";
import {MatDialog} from "@angular/material/dialog";
import {
  WorkflowReadonlyViewDialogComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view-dialog/workflow-readonly-view-dialog.component";
import {Router, RouterLink} from "@angular/router";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

@Component({
  selector: 'lib-workflow-list',
  imports: [
    WorkflowOverviewCardComponent,
    RouterLink,
    HeaderComponent
  ],
  templateUrl: './workflow-list.component.html',
  styleUrl: './workflow-list.component.scss',
})
export class WorkflowListComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly router: Router = inject(Router);

  appId = input<number>();

  readonly allWorkflows = this.store.selectSignal(
    selectWorkflows
  );

  readonly workflowsForApp = this.store.selectSignal(selectWorkflowsForApp(this.appId()));

  readonly workflows = computed(() => {
    return this.allWorkflows() ?? this.workflowsForApp();
  });

  readonly route = computed(() => {
    return true;
  });

  private readonly loadEffect = effect(() => {
    const id = this.appId();
    if (id != null) {
      this.store.dispatch(
        listWorkflowForApp({
          appId: id,
        })
      );
    } else {
      this.store.dispatch(listWorkflows());
    }
  });

  onAddNewOne() {
    this.router.navigate(['/workflow', 'new']);
  }

  onWorkflowClicked(workflow: WorkflowDTO): void {
    this.dialog.open(WorkflowReadonlyViewDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: workflow,
    });
  }
}

import {Component, computed, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {
  WorkflowReadonlyViewComponent
} from "@shared-lib/modules/workflow/components/workflow-readonly-view/workflow-readonly-view.component";
import {selectSelectedWorkflow} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {selectLoading} from "@global-app/project/store/project-federated-experiments.selectors";
import * as WorkflowActions from "@shared-lib/modules/workflow/store/workflow.actions";
import {Store} from "@ngrx/store";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'lib-workflow-readonly-view-dialog',
  imports: [
    CloseableDialogTitleComponent,
    WorkflowReadonlyViewComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './workflow-readonly-view-dialog.component.html',
  styleUrl: './workflow-readonly-view-dialog.component.scss',
})
export class WorkflowReadonlyViewDialogComponent implements OnInit {
  private readonly store: Store = inject(Store);
  readonly dialogRef = inject(MatDialogRef<WorkflowReadonlyViewDialogComponent>);
  readonly data = inject<WorkflowDTO>(MAT_DIALOG_DATA);

  selectedWorkflow = this.store.selectSignal(selectSelectedWorkflow);
  loading = this.store.selectSignal(selectLoading);
  workflow = computed(() => {
    const w = this.selectedWorkflow();
    if (w) {
      return {
        ...w,
        nodes: w.nodes.map(n => ({...n}))
      }
    }
    return w;
  });

  ngOnInit() {
    this.store.dispatch(WorkflowActions.loadWorkflow({id: this.data.id}));
  }


  getDialogTitle() {
    return "WorkflowReadonlyViewDialog";
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}

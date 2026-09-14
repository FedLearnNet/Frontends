import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {WorkflowChatComponent} from "@shared-lib/modules/workflow/components/workflow-chat/workflow-chat.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {Store} from "@ngrx/store";
import {WorkflowChatActions} from "@shared-lib/modules/workflow/store/workflow-chat.actions";

@Component({
  selector: 'lib-workflow-chat-dialog',
  imports: [
    WorkflowChatComponent,
    CloseableDialogTitleComponent,
    ErrorCardComponent
  ],
  templateUrl: './workflow-chat-dialog.component.html',
  styleUrl: './workflow-chat-dialog.component.scss',
})
export class WorkflowChatDialogComponent implements OnInit, OnDestroy {
  public readonly dialogRef = inject(MatDialogRef<WorkflowChatDialogComponent, boolean>);
  private readonly store: Store = inject(Store);
  public readonly data = inject<number>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.store.dispatch(WorkflowChatActions.connect({workflowId: this.data}));
  }

  ngOnDestroy(): void {
    this.store.dispatch(WorkflowChatActions.disconnect());
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('980px', '100vh');
    }
  }
}

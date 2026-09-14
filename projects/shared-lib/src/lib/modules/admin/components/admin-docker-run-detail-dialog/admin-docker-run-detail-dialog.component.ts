import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Store} from '@ngrx/store';
import {
  CloseableDialogTitleComponent
} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {OrchRelayService} from '@shared-lib/modules/admin/services/orch.service';
import {OrchActions} from '@shared-lib/modules/admin/store/orch.actions';
import {
  selectOrchError,
  selectRunLoading,
  selectRunLogsByRunId,
  selectRunLogsLoading,
  selectSelectedRun
} from '@shared-lib/modules/admin/store/orch.selectors';
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {dockerStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";

export interface AdminDockerRunDetailDialogData {
  runId: number;
}

@Component({
  selector: 'lib-admin-docker-run-detail-dialog',
  imports: [
    DatePipe,
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatIconModule,
    MatProgressSpinnerModule,
    CloseableDialogTitleComponent,
    ErrorCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-docker-run-detail-dialog.component.html',
  styleUrl: './admin-docker-run-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDockerRunDetailDialogComponent {
  private readonly store = inject(Store);
  private readonly orchService = inject(OrchRelayService);
  private readonly snackBar = inject(MatSnackBar);

  readonly dialogRef = inject(MatDialogRef<AdminDockerRunDetailDialogComponent>);
  readonly data = inject<AdminDockerRunDetailDialogData>(MAT_DIALOG_DATA);

  readonly run = this.store.selectSignal(selectSelectedRun);
  readonly logs = this.store.selectSignal(selectRunLogsByRunId(this.data.runId));
  readonly loading = this.store.selectSignal(selectRunLoading);
  readonly logsLoading = this.store.selectSignal(selectRunLogsLoading);
  readonly error = this.store.selectSignal(selectOrchError);

  readonly downloadHref = computed(() => {
    const run = this.run();
    if (!run || run.workflowId == null || run.appId == null || run.workflowStep == null) {
      return null;
    }

    return this.orchService.volumeWorkflowDownloadHref(run.workflowId, run.appId, run.workflowStep);
  });

  readonly rawJson = computed(() => JSON.stringify(this.run(), null, 2));

  constructor() {
    this.store.dispatch(OrchActions.loadRunDetail({id: this.data.runId}));
  }

  async copyToClipboard(value?: string | null, label: string = 'Value'): Promise<void> {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    this.snackBar.open(`${label} copied`, 'Close', {duration: 2000});
  }

  protected readonly dockerStatusToBadgeStatus = dockerStatusToBadgeStatus;
}

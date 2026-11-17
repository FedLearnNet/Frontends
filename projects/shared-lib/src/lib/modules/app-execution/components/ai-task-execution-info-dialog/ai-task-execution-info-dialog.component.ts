import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {BaseAuthDto} from "@shared-lib/base/base-dto";
import {RunStatusTypes} from "../../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {
  ConsoleOutputComponent
} from "@shared-lib/modules/app-execution/components/console-output/console-output.component";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {MatDivider} from "@angular/material/list";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {Store} from "@ngrx/store";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {RunMeta} from "@shared-lib/modules/app-execution/dto/run-meta";
import {
  currentStep,
  DataAnalysisRunDTO,
  displayedAttempt,
  errorOf
} from "@shared-lib/modules/app-execution/dto/execution-run";
import {
  RunPerformanceComponent
} from "@shared-lib/components/run-performance/run-performance.component";


export interface TaskExecutionInfoDialogData extends BaseAuthDto {
  status: RunStatusTypes;
  lastLog?: string
  lastError?: string
  rawLog?: string
  containerId?: string;
  dataAnalysisId?: number;
  meta?: RunMeta | null;
}

/** A run as the dialog shows it, by the attempt of its current step. */
export function taskExecutionInfoOf(run: DataAnalysisRunDTO): TaskExecutionInfoDialogData {
  const step = currentStep(run);
  const attempt = step ? displayedAttempt(step) : undefined;
  return {
    id: run.id,
    version: run.version,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    keycloakId: run.keycloakId,
    status: run.status,
    lastLog: attempt?.lastLog ?? undefined,
    lastError: errorOf(run),
    containerId: attempt?.containerId ?? undefined,
    dataAnalysisId: run.dataAnalysisId ?? undefined,
    meta: attempt?.meta,
  };
}

@Component({
  selector: 'lib-ai-task-execution-info-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MatTab,
    MatTabGroup,
    ConsoleOutputComponent,
    KvComponent,
    TimeBadgeComponent,
    MatDivider,
    StatusBadgeComponent,
    MatButton,
    MatIcon,
    RunPerformanceComponent
  ],
  templateUrl: './ai-task-execution-info-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ai-task-execution-info-dialog.component.scss',
})
export class AiTaskExecutionInfoDialogComponent {
  private readonly dialogRef: MatDialogRef<AiTaskExecutionInfoDialogComponent> = inject(MatDialogRef);
  readonly data = inject<TaskExecutionInfoDialogData>(MAT_DIALOG_DATA);
  private readonly store: Store = inject(Store);

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  get isDone(): boolean {
    const status = this.data.status;
    return (status === RunStatusTypes.STOPPED
      || status === RunStatusTypes.FINISHED
      || status === RunStatusTypes.ERROR);
  }

  get hasNeededInfoForDelete(): boolean {
    return (this.data.dataAnalysisId !== undefined && this.data.id !== undefined);
  }

  public delete(): void {
    if (!this.hasNeededInfoForDelete) {
      return;
    }
    this.store.dispatch(
      DataAnalysisActions.deleteRun({
        dataAnalysisId: this.data.dataAnalysisId!,
        id: this.data.id,
      }));
    this.dialogRef.close();
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}

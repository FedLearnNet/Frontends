import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {
  ExperimentWorkflowNodeDetailComponent
} from "@shared-lib/modules/experiments/components/experiment-workflow-node-detail/experiment-workflow-node-detail.component";
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {StatusTitleComponent} from "@shared-lib/components/status-title/status-title.component";
import {TranslatePipe} from "@ngx-translate/core";
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {FLNetParticipantRole} from "../../../../dto/federated-test-run";
import {FederatedRunService} from "../../../../service/federated-run.service";
import {participantOf, participantsOf, RunStatusTypes, TestAttemptDTO, TestRunDTO} from "../../../../dto/test-run";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";

interface TestDetail {
  app: AppDetailDto;
  run: TestRunDTO;
  participant: TestAttemptDTO
}


@Component({
  selector: 'app-app-app-run-federated-test-detail-participant-dialog',
  imports: [
    ExperimentWorkflowNodeDetailComponent,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    StatusTitleComponent,
    TranslatePipe,
    InfoCardComponent
  ],
  templateUrl: './app-app-run-federated-test-detail-participant-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-app-run-federated-test-detail-participant-dialog.component.scss'
})
export class AppAppRunFederatedTestDetailParticipantDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AppAppRunFederatedTestDetailParticipantDialogComponent>);
  private readonly testRunService: FederatedRunService = inject(FederatedRunService);
  readonly data = inject<TestDetail>(MAT_DIALOG_DATA);

  // The participant as listed first, then from the run detail with its logs and metrics.
  protected readonly participant = signal<TestAttemptDTO>(this.data.participant);
  // Who the attempt stands for.
  protected readonly info = computed(() => participantOf(this.data.run, this.participant()));
  protected readonly experimentData = computed<ExperimentData>(() => {
    const participant = this.participant();
    return {
      logs: participant.logs ?? [],
      metric: participant.metrics ?? [],
      experimentId: this.data.run.id,
      error: participant.failure?.message ?? undefined,
      stepId: this.data.app.id,
      status: participant.status,
      hyperParams: (participant.params ?? {}) as { [key: string]: string },
      inputData: {
        data: this.info()?.inputFilePaths ?? {},
        files: [],
      },
      outputData: {
        data: (participant.outputData ?? {}) as { [key: string]: string },
        files: (participant.outputFiles ?? []).map(output => output.file),
      },
    };
  });

  ngOnInit(): void {
    this.testRunService.getRun(this.data.app.id, this.data.run.id).subscribe(run => {
      const participant = participantsOf(run).find(attempt => attempt.id === this.data.participant.id);
      if (participant) {
        this.participant.set(participant);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
  protected readonly RunStatusTypes = RunStatusTypes;
  protected readonly FLNetParticipantRole = FLNetParticipantRole;
}

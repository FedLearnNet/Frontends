import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
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
import {FederatedParticipantDTO, FederatedTestRunDTO, FLNetParticipantRole} from "../../../../dto/federated-test-run";
import {FederatedRunService} from "../../../../service/federated-run.service";
import {RunStatusTypes} from "../../../../dto/test-run";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";

interface TestDetail {
  app: AppDetailDto;
  run: FederatedTestRunDTO;
  participant: FederatedParticipantDTO
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
  styleUrl: './app-app-run-federated-test-detail-participant-dialog.component.scss'
})
export class AppAppRunFederatedTestDetailParticipantDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AppAppRunFederatedTestDetailParticipantDialogComponent>);
  private readonly testRunService: FederatedRunService = inject(FederatedRunService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly data = inject<TestDetail>(MAT_DIALOG_DATA);

  experimentData = {
    logs: [],
    metric: [],
    experimentId: this.data.run.id,
    error: this.data.run.error,
    stepId: this.data.app.id,
    status: this.data.run.status,
    hyperParams: this.data.participant.hyperParams,
    inputData: {
      data: this.data.participant.inputFilePaths,
      files: [],
    },
    outputData: {
      data: {},
      files: [],
    },
  } as ExperimentData;

  ngOnInit(): void {
    this.testRunService.getLogs(this.data.app.id, this.data.run.id, this.data.participant.id).subscribe(logs => {
      this.experimentData.logs = logs;
      this.cdr.detectChanges();
    });
    this.testRunService.getMetrics(this.data.app.id, this.data.run.id, this.data.participant.id).subscribe(
      (metrics) => {
        this.experimentData.metric = metrics;
        this.cdr.detectChanges();
      }
    )
    this.cdr.detectChanges();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
  protected readonly RunStatusTypes = RunStatusTypes;
  protected readonly FLNetParticipantRole = FLNetParticipantRole;
}

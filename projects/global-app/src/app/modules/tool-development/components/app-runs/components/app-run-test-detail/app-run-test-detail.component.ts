import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {TestRunDTO} from "../../../../dto/test-run";
import {TestRunService} from "../../../../service/test-run.service";
import {RunType} from "../../../../dto/socket";
import {TranslatePipe} from "@ngx-translate/core";
import {
  ExperimentWorkflowNodeDetailComponent
} from "@shared-lib/modules/experiments/components/experiment-workflow-node-detail/experiment-workflow-node-detail.component";
import {StatusTitleComponent} from "@shared-lib/components/status-title/status-title.component";
import {RunPerformanceComponent} from "@shared-lib/components/run-performance/run-performance.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {ExperimentData} from "@shared-lib/modules/experiments/models/experiment-data";


interface TestDetail {
  app: AppDetailDto;
  run: TestRunDTO;
  nr: number
}

@Component({
  selector: 'app-app-run-test-detail',
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    ExperimentWorkflowNodeDetailComponent,
    StatusTitleComponent,
    RunPerformanceComponent,
    TranslatePipe,
  ],
  templateUrl: './app-run-test-detail.component.html',
  styleUrl: './app-run-test-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRunTestDetailComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AppRunTestDetailComponent>);
  private readonly testRunService: TestRunService = inject(TestRunService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly data = inject<TestDetail>(MAT_DIALOG_DATA);

  experimentData = {
    logs: [],
    metric: [],
    experimentId: this.data.run.id,
    error: this.data.run.error,
    stepId: this.data.app.id,
    status: this.data.run.status,
    hyperParams: this.data.run.hyperParams,
    inputData: {
      data: this.data.run.inputData,
      files: [],
    },
    outputData: {
      data: this.data.run.outputData,
      files: [],
    },
  } as ExperimentData;

  ngOnInit(): void {
    this.testRunService.getLogs(this.data.app.id, this.data.run.id).subscribe(logs => {
      this.experimentData.logs = logs;
      this.cdr.detectChanges();
    });
    this.testRunService.getMetrics(this.data.app.id, this.data.run.id).subscribe(
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

  getRunType(): RunType {
    return RunType.TEST_RUN
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}

import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {testAttemptOf, TestRunDTO, testStepOf} from "../../../../dto/test-run";
import {errorOf} from "@shared-lib/modules/app-execution/dto/execution-run";
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
  readonly data = inject<TestDetail>(MAT_DIALOG_DATA);

  // The listed run first, then the detail with the logs and metrics of its attempt.
  protected readonly run = signal<TestRunDTO>(this.data.run);
  protected readonly meta = computed(() => testAttemptOf(this.run())?.meta);
  protected readonly experimentData = computed<ExperimentData>(() => {
    const run = this.run();
    const step = testStepOf(run);
    const attempt = testAttemptOf(run);
    return {
      logs: attempt?.logs ?? [],
      metric: attempt?.metrics ?? [],
      experimentId: run.id,
      error: errorOf(run),
      stepId: this.data.app.id,
      status: run.status,
      hyperParams: (attempt?.params ?? {}) as { [key: string]: string },
      inputData: {
        data: {...(step?.inputs ?? {}), ...(step?.inputFilePaths ?? {})} as { [key: string]: string },
        files: [],
      },
      outputData: {
        data: (attempt?.outputData ?? {}) as { [key: string]: string },
        files: [],
      },
    };
  });

  ngOnInit(): void {
    this.testRunService.getRun(this.data.app.id, this.data.run.id).subscribe(run => this.run.set(run));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getRunType(): RunType {
    return RunType.TEST_RUN
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {RunStatusTypes, TestRunDTO} from "../../../../dto/test-run";
import {MatExpansionModule} from "@angular/material/expansion";
import {TestRunService} from "../../../../service/test-run.service";
import {EMPTY, Observable} from "rxjs";
import {RunMessageDTO, RunMessageLogDTO, RunMessageMetricDTO} from "../../../../dto/log";
import {SimpleMetricLineComponent} from "../metrics/simple-metric-line/simple-metric-line.component";
import {AppLogTableComponent} from "../app-log-table/app-log-table.component";

interface TestDetail {
  app: AppDetailDto;
  run: TestRunDTO;
  nr: number
}

@Component({
  selector: 'app-app-run-test-detail',
  standalone: true,
  imports: [CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatExpansionModule,
    SimpleMetricLineComponent,
    AppLogTableComponent],
  templateUrl: './app-run-test-detail.component.html',
  styleUrl: './app-run-test-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRunTestDetailComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AppRunTestDetailComponent>);
  private readonly testRunService: TestRunService = inject(TestRunService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  readonly data = inject<TestDetail>(MAT_DIALOG_DATA);
  logs$: Observable<RunMessageLogDTO[]> = EMPTY;

  metrics: Map<string, RunMessageMetricDTO[]> = new Map<string, RunMessageMetricDTO[]>();

  ngOnInit(): void {
    this.logs$ = this.testRunService.getLogs(this.data.app.id, this.data.run.id);
    this.testRunService.getMetrics(this.data.app.id, this.data.run.id).subscribe(
      (metrics) => {
        this.metrics = metrics.reduce((acc, metric) => {
          if (!acc.has(metric.metric)) {
            acc.set(metric.metric, []);
          }
          acc.get(metric.metric)!.push(metric);
          return acc;
        }, new Map<string, RunMessageMetricDTO[]>());
        this.cdr.detectChanges();
      }
    )
    this.cdr.detectChanges();
  }

  getMetrics(metric: string): RunMessageMetricDTO[] {
    return this.metrics.get(metric) || [];
  }

  getMetricsNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  onRunClick(): void {
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getHyperParamNames(): string[] {
    return Object.keys(this.data.run.hyperParams);
  }

  getOutputNames(): string[] {
    return Object.keys(this.data.run.outputData);
  }

  getInputNames(): string[] {
    return Object.keys(this.data.run.inputData);
  }

  isRunError(): boolean {
    return this.data.run.error !== null || this.data.run.status.toLowerCase() === RunStatusTypes.ERROR.toLowerCase();
  }

  isRunSuccess(): boolean {
    return this.data.run.status.toLowerCase() === RunStatusTypes.FINISHED.toLowerCase()
  }


}

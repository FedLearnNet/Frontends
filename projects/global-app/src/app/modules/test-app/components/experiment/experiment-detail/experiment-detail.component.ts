import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ExperimentDetailDTO, ExperimentRunDTO} from "../../../dto/experiment";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {DatePipe, JsonPipe} from "@angular/common";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {RunStatusTypes, TestRunDTO} from "../../../dto/test-run";
import {ExperimentService} from "../../../service/experiment-run.service";
import {RunMessageMetricDTO, RunMessageTypes} from "../../../dto/log";
import {ExperimentRunsChartsComponent} from "../experiment-runs-charts/experiment-runs-charts.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatButtonModule} from "@angular/material/button";
import {ExperimentHeaderComponent} from "../experiment-header/experiment-header.component";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {MatTabGroup} from "@angular/material/tabs";
import {ExperimentDiagramConfigDTO} from "../../../dto/config";
import {ExperimentRunCircleComponent} from "../experiment-run-circle/experiment-run-circle.component";
import {ModelVersionDto} from "@global-app/model-store/dto/model";
import {ModelService} from "@global-app/model-store/services/model.service";

@Component({
  selector: 'app-experiment-detail',
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinner,
    ExperimentRunsChartsComponent,
    RouterLink,
    ExperimentHeaderComponent,
    SharedLibModule,
    ExperimentRunCircleComponent
  ],
  templateUrl: './experiment-detail.component.html',
  styleUrl: './experiment-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentDetailComponent implements OnInit, AfterViewInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly experimentService: ExperimentService = inject(ExperimentService);
  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly modelService: ModelService = inject(ModelService);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['select', 'element', 'actions'];
  runDataSource = new MatTableDataSource<ExperimentRunDTO>();
  runSelection = new SelectionModel<ExperimentRunDTO>(true, []);

  metrics: RunMessageMetricDTO[] = [];

  experimentRuns: ExperimentRunDTO[] = Array.from({length: 20}, (_, i) => this.createExperimentRun(i + 1));


  public app?: AppDetailDto;
  public experiment?: ExperimentDetailDTO;
  public modelVersion?: ModelVersionDto;

  ngOnInit(): void {

    this.activatedRoute.data.subscribe((data) => {
      this.app = data["app"];
      this.experiment = data["experiment"];
      if (this.experiment) {
        this.runDataSource.data = this.experiment.runs;
        //this.runDataSource.data = this.experimentRuns;
        this.runSelection.select(...this.runDataSource.data);
        this.modelService.getSubModelForExperiment(this.experiment.id).subscribe((model) => {
          this.modelVersion = model;
          this.changeDetectorRef.detectChanges();
        });
        if (this.app) {
          this.experimentService.getMetrics(this.app.id, this.experiment.id).subscribe((metrics) => {
            this.metrics = metrics;
            this.changeDetectorRef.detectChanges();
          });
        }
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  ngAfterViewInit() {
    this.runDataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.runDataSource.filter = filterValue.trim().toLowerCase();

    if (this.runDataSource.paginator) {
      this.runDataSource.paginator.firstPage();
    }
    this.changeDetectorRef.detectChanges();
  }

  isRunError(dto: ExperimentRunDTO): boolean {
    return dto.status.toLowerCase() === RunStatusTypes.ERROR.toLowerCase();
  }

  isRunSuccess(dto: ExperimentRunDTO): boolean {
    return dto.status.toLowerCase() === RunStatusTypes.FINISHED.toLowerCase()
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.runSelection.selected.length;
    const numRows = this.runDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.runSelection.clear();
      return;
    }

    this.runSelection.select(...this.runDataSource.data);
    this.changeDetectorRef.detectChanges();
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ExperimentRunDTO): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.runSelection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }


  hyperParamToDataSource(hyperParams: object): { key: string; value: any; }[] {
    return Object.entries(hyperParams || {}).map(([key, value]) => ({ key, value }));
  }

  diagramsChanged(diagrams: ExperimentDiagramConfigDTO[]): void {
    if(!this.experiment || !this.app) {
      console.error("Experiment or app not found");
      return;
    }
    this.experiment!.diagramConfigs = diagrams;
    this.experimentService.updateExperiment(this.app!.id!, this.experiment!).subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  createRandomMetric(metricName: string, runId: number): RunMessageMetricDTO {
    return {
      id: Math.floor(Math.random() * 1000),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      process: "process_name",
      message: "Metric generated",
      type: RunMessageTypes.METRIC,
      runId: runId,
      metric: metricName,
      value: (this.randomIntFromInterval(0, 100) / 100).toFixed(2), // Beispielwert
      x: (Math.random() * 10).toFixed(2), // Beispielwert
      xUnit: "seconds"
    };
  }

  randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  createExperimentRun(id: number): ExperimentRunDTO {
    const runId = id;
    return {
      id: runId,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: RunStatusTypes.FINISHED,
      error: "",
      name: `Run_${runId}`,
      color: this.generateRandomColor(),
      outputData: {
        "output1": "output1",
        "output2": "output2",
        "output3": "output3",
        "output4": "output4"
      },
      hyperParams: {
        alpha: (Math.random() * 1).toFixed(2),
        lambda: (Math.random() * 1).toFixed(2),
        max_depth: Math.floor(Math.random() * 10).toString()
      },
      metrics: [
        ...Array.from({length: 10}, () => this.createRandomMetric("rmse", runId)),
        ...Array.from({length: 10}, () => this.createRandomMetric("acc", runId))
      ],
      experimentId: Math.floor(Math.random() * 100)
    };
  }

  generateRandomColor(): string {
    const randomInt = Math.floor(Math.random() * 0xffffff);
    return `#${randomInt.toString(16).padStart(6, '0')}`;
  }


}

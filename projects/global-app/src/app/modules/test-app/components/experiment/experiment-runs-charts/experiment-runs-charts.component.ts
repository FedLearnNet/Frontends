import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit, Output,
  SimpleChanges
} from '@angular/core';
import {CommonModule, JsonPipe} from "@angular/common";
import {
  ExperimentsMetricParameterParallelComponent
} from "./experiments-metric-parameter-parallel/experiments-metric-parameter-parallel.component";
import {ExperimentRunDTO} from "../../../dto/experiment";
import {MatExpansionModule} from "@angular/material/expansion";
import {
  ExperimentsMetricParameterHeatmapComponent
} from "./experiments-metric-parameter-heatmap/experiments-metric-parameter-heatmap.component";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {ExperimentsChartGenericComponent} from "./experiments-chart-generic/experiments-chart-generic.component";
import {groupRunsByMetric, getHyperParams} from "./experiment-runs-charts-helper";
import {ExperimentDiagramConfigDTO} from "../../../dto/config";
import {
  ExperimentsChartGenericEditComponent
} from "./experiments-chart-generic-edit/experiments-chart-generic-edit.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-experiment-runs-charts',
  standalone: true,
  imports: [
    JsonPipe,
    CommonModule,
    MatExpansionModule,
    ExperimentsMetricParameterParallelComponent,
    ExperimentsMetricParameterHeatmapComponent,
    CdkDropList,
    CdkDrag,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ExperimentsChartGenericComponent
  ],
  templateUrl: './experiment-runs-charts.component.html',
  styleUrl: './experiment-runs-charts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentRunsChartsComponent implements OnInit, OnChanges {
  private readonly dialog = inject(MatDialog);
  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() experimentRuns: ExperimentRunDTO[] = [];
  @Input() diagrams?: ExperimentDiagramConfigDTO[] = [];

  @Output() changed: EventEmitter<ExperimentDiagramConfigDTO[]> = new EventEmitter<ExperimentDiagramConfigDTO[]>();

  metricGroupedRuns = new Map<string, ExperimentRunDTO[]>();
  hyperParamKeys: string[] = [];


  ngOnInit(): void {
    if (!this.diagrams) {
      this.diagrams = [];
    }
    this.metricGroupedRuns = groupRunsByMetric(this.experimentRuns);
    if (this.experimentRuns.length > 0) {
      this.hyperParamKeys = getHyperParams(this.experimentRuns[0]);
    }
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["experimentRuns"]) {
      this.metricGroupedRuns = groupRunsByMetric(this.experimentRuns);
      if (this.experimentRuns.length > 0) {
        this.hyperParamKeys = getHyperParams(this.experimentRuns[0]);
      }
      this.changeDetectorRef.detectChanges();
    }
  }


  getMetricKeys(): string[] {
    return Array.from(this.metricGroupedRuns.keys());
  }

  getRunsByMetric(metric: string): ExperimentRunDTO[] {
    return this.metricGroupedRuns.get(metric) || [];
  }


  newChart(): void {
    const dialogRef = this.dialog.open(ExperimentsChartGenericEditComponent, {
      data: {experimentRuns: this.experimentRuns},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.diagrams!.push(result);
        this.changeDetectorRef.detectChanges();
      }
    });

  }

  diagramChange(diagram: ExperimentDiagramConfigDTO, i: number): void {
    this.diagrams![i] = diagram;
  }

  drop(event: CdkDragDrop<ExperimentDiagramConfigDTO[]>) {
    moveItemInArray(this.diagrams!, event.previousIndex, event.currentIndex);
    this.changeDetectorRef.detectChanges();
  }

  save(): void {
    this.changed.emit(this.diagrams);
  }
}

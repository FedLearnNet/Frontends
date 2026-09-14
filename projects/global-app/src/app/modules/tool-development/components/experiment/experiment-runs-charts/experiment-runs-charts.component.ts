import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  input,
  output
} from '@angular/core';

import {
  ExperimentsMetricParameterParallelComponent
} from "./experiments-metric-parameter-parallel/experiments-metric-parameter-parallel.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {
  ExperimentsMetricParameterHeatmapComponent
} from "./experiments-metric-parameter-heatmap/experiments-metric-parameter-heatmap.component";
import {CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {ExperimentsChartGenericComponent} from "./experiments-chart-generic/experiments-chart-generic.component";
import {getHyperParams, groupRunsByMetric} from "./experiment-runs-charts-helper";
import {ExperimentDiagramConfigDTO} from "../../../dto/config";
import {
  ExperimentsChartGenericEditComponent
} from "./experiments-chart-generic-edit/experiments-chart-generic-edit.component";
import {MatDialog} from "@angular/material/dialog";
import {ExperimentRunDTO} from "@shared-lib/modules/app-execution/dto/experiment";

@Component({
    selector: 'app-experiment-runs-charts',
    imports: [
    MatExpansionModule,
    ExperimentsMetricParameterParallelComponent,
    ExperimentsMetricParameterHeatmapComponent,
    CdkDropList,
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

  readonly experimentRuns = input<ExperimentRunDTO[]>([]);

  @Input() diagrams?: ExperimentDiagramConfigDTO[] = [];

  readonly changed = output<ExperimentDiagramConfigDTO[] | undefined>();

  metricGroupedRuns = new Map<string, ExperimentRunDTO[]>();
  hyperParamKeys: string[] = [];


  ngOnInit(): void {
    if (!this.diagrams) {
      this.diagrams = [];
    }
    this.metricGroupedRuns = groupRunsByMetric(this.experimentRuns());
    if (this.experimentRuns().length > 0) {
      this.hyperParamKeys = getHyperParams(this.experimentRuns()[0]);
    }
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["experimentRuns"]) {
      this.metricGroupedRuns = groupRunsByMetric(this.experimentRuns());
      if (this.experimentRuns().length > 0) {
        this.hyperParamKeys = getHyperParams(this.experimentRuns()[0]);
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
      data: {experimentRuns: this.experimentRuns()},
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

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges
} from '@angular/core';
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from 'echarts/core';

import {EChartsOption, SeriesOption} from "echarts";
import {MatDialog} from "@angular/material/dialog";
import {ExperimentDiagramConfigDTO} from "../../../../dto/config";
import {
  ExperimentsChartGenericEditComponent
} from "../experiments-chart-generic-edit/experiments-chart-generic-edit.component";
import {CdkDrag} from "@angular/cdk/drag-drop";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import {RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";
import {getHyperParams} from "../experiment-runs-charts-helper";
import {XAXisOption, YAXisOption} from "echarts/types/dist/shared";
import {ExperimentRunDTO} from "@shared-lib/modules/app-execution/dto/experiment";
import {ParallelChart} from "echarts/charts";
import {TitleComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";

echarts.use([ParallelChart, TitleComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-experiments-chart-generic',
  imports: [NgxEchartsDirective, CdkDrag, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './experiments-chart-generic.component.html',
  styleUrl: './experiments-chart-generic.component.scss',
  providers: [
    provideEchartsCore({echarts}),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsChartGenericComponent implements OnInit, OnChanges {
  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);

  readonly experimentRuns = input<ExperimentRunDTO[]>([]);

  @Input() config: ExperimentDiagramConfigDTO;

  readonly changed = output<ExperimentDiagramConfigDTO>();

  hyperParamKeys: string[] = [];
  randomId: string = Math.random().toString(36).substring(7);

  chartOption: EChartsOption = {};

  ngOnInit(): void {
    if (this.experimentRuns().length > 0) {
      this.hyperParamKeys = getHyperParams(this.experimentRuns()[0]);
    }
    this.chartOption = this.getChart();
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["experimentRuns"]) {
      this.chartOption = this.getChart();
      this.changeDetectorRef.detectChanges();
    }
  }

  getMetricForHyper(run: ExperimentRunDTO, hyperParamName: string, metric: string, mode: string, metricFirst?: boolean): (number | string)[] {
    const hyperParam = run.hyperParams[hyperParamName];
    const metrics: RunMessageMetricDTO[] = run.metrics
      .filter((m: RunMessageMetricDTO) => m.metric === metric);
    const metricValues: number[] = metrics.map((m: RunMessageMetricDTO) => +m.value);

    let metricValue: number = 0;
    if (mode === 'max') {
      metricValue = Math.max(...metricValues);
    }
    if (mode === 'min') {
      metricValue = Math.min(...metricValues);

    }
    if (mode === 'avg') {
      metricValue = (Math.max(...metricValues) / metrics.length);

    }
    if (metricFirst) {
      return [metricValue, hyperParam];
    }
    return [hyperParam, metricValue];
  }

  getMetricForRun(run: ExperimentRunDTO, metric: string, mode: string): (number | string)[] {
    const metrics: RunMessageMetricDTO[] = run.metrics
      .filter((m: RunMessageMetricDTO) => m.metric === metric);
    const metricValues: number[] = metrics.map((m: RunMessageMetricDTO) => +m.value);

    if (mode === 'all') {
      return metricValues;
    }
    let metricValue: number = 0;
    if (mode === 'max') {
      metricValue = Math.max(...metricValues);
    }
    if (mode === 'min') {
      metricValue = Math.min(...metricValues);

    }
    if (mode === 'avg') {
      metricValue = (Math.max(...metricValues) / metrics.length);

    }

    return [metricValue];
  }

  getSeriesForHyperMetric(): SeriesOption[] {
    const series: SeriesOption[] = [];
    let metricFirst = false;
    let hyperParamName = this.config.yAxisHeader;
    let metric = this.config.xAxisHeader;
    const aggregator = this.config.dataAggregatorType ?? 'max';
    if (this.hyperParamKeys.includes(this.config.xAxisHeader)) {
      metricFirst = true;
      hyperParamName = this.config.xAxisHeader;
      metric = this.config.yAxisHeader;
    }

    const data = this.experimentRuns().map(run => {
      return this.getMetricForHyper(run,
        hyperParamName, metric, aggregator, metricFirst);
    });


    series.push({
      data: data,
      type: 'scatter',
      encode: {tooltip: [0, 1]},
    });
    return series;
  }

  getMetricsForRun(): SeriesOption[] {

    const series: SeriesOption[] = [];
    let metric = this.config.xAxisHeader;
    const aggregator = this.config.dataAggregatorType ?? 'all';
    if (this.config.xAxisHeader === 'run') {
      metric = this.config.yAxisHeader;
    }


    if (aggregator === 'all') {
      this.experimentRuns().map(run => {
        const seriesData = this.getMetricForRun(run, metric, aggregator);
        if (this.config.seriesType === 'line') {
          series.push({
            data: seriesData,
            type: this.config.seriesType,
            lineStyle: {
              color: run.color
            }
          });
        } else {
          series.push({
            data: seriesData,
            type: this.config.seriesType
          });
        }
      });

    } else {
      const data = this.experimentRuns().map(run => {
        return this.getMetricForRun(run, metric, aggregator);
      });

      series.push({
        data: data.flat(),
        type: this.config.seriesType
      });
    }

    return series;
  }

  getSeries(): SeriesOption[] {
    if (this.isSeriesForHyper()) {
      return this.getSeriesForHyperMetric();
    }
    if (this.config.xAxisHeader === 'run') {
      return this.getMetricsForRun();
    }
    return [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: this.config.seriesType
    }];
  }

  getXAXisOption(): XAXisOption {

    const aggregator = this.config.dataAggregatorType ?? 'all';

    if (this.config.xAxisHeader === 'run') {
      if (aggregator === 'all') {
        if (this.experimentRuns().length > 0) {
          const name = this.experimentRuns()[0].metrics.map(m => m.xUnit);
          return {
            name: name[0],
            type: 'category',
            data: this.experimentRuns()[0].metrics.map(m => m.x)
          };
        }
      } else {
        return {
          name: 'Run',
          type: 'category',
          data: this.experimentRuns().map(run => run.name)
        };
      }

    }

    return {
      name: this.config.xAxisHeader,
      //type: 'category',
      type: 'value',
      //data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };
  }

  getYAXisOption(): YAXisOption {
    return {
      name: this.config.yAxisHeader,
      type: 'value'
    };
  }

  isSeriesForHyper(): boolean {
    return this.hyperParamKeys.includes(this.config.xAxisHeader)
      || this.hyperParamKeys.includes(this.config.yAxisHeader);
  }

  getChart(): EChartsOption {
    return {
      title: {
        text: this.config.name,
        textStyle: {
          fontSize: 14,
          align: 'center',
        },
      },
      tooltip: {
        position: 'top'
      },
      xAxis: this.getXAXisOption(),
      yAxis: this.getYAXisOption(),
      series: this.getSeries()
    };
  }

  editChart(): void {
    const dialogRef = this.dialog.open(ExperimentsChartGenericEditComponent, {
      data: {config: this.config, experimentRuns: this.experimentRuns()},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.config = result;
        this.chartOption = this.getChart();
        this.changeDetectorRef.detectChanges();
        this.changed.emit(this.config);
      }
    });
  }
}

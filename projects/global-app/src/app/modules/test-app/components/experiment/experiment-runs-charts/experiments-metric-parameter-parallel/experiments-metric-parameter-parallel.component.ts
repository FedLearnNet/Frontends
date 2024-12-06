import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NgxEchartsDirective, provideEcharts} from "ngx-echarts";
import {EChartsOption} from "echarts";
import {RunMessageMetricDTO} from "../../../../dto/log";
import {ExperimentRunDTO} from "../../../../dto/experiment";
import {ParallelAxisOption} from "echarts/types/src/coord/parallel/AxisModel";

@Component({
  selector: 'app-experiments-metric-parameter-parallel',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './experiments-metric-parameter-parallel.component.html',
  styleUrl: './experiments-metric-parameter-parallel.component.scss',
  providers: [
    provideEcharts(),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsMetricParameterParallelComponent implements OnInit {
  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input() experimentRuns: ExperimentRunDTO[] = [];
  @Input() metricName: string = '';
  @Input() hyperParams: string[] = [];
  @Input() mode: string = 'max';

  randomId: string = Math.random().toString(36).substring(7);

  chartOption: EChartsOption = {};


  ngOnInit(): void {
    this.chartOption = this.getChart();
    this.changeDetectorRef.detectChanges();
  }

  getName(): string {
    return this.metricName + ' for ' + this.mode + 'reported metric values';
  }

  getMaxMetricValue(): number {
    return Math.max(...this.experimentRuns.map(run => Math.max(...run.metrics.map(m => +m.value))));
  }

  getMinMetricValue(): number {
    return Math.min(...this.experimentRuns.map(run => Math.min(...run.metrics.map(m => +m.value))));
  }

  getParallelAxis(): ParallelAxisOption[] {
    const axis: ParallelAxisOption[] = [];
    for (const param of this.hyperParams) {
      axis.push({dim: axis.length, name: param});
    }
    axis.push({dim: axis.length, name: this.metricName});
    return axis;
  }

  formatData(): (number | string)[][] {
    const data: (number | string)[][] = [];
    for (const run of this.experimentRuns) {
      data.push(this.getData(run));
    }
    return data;
  }

  getData(run: ExperimentRunDTO): (number | string)[] {
    const data: (number | string)[] = [];
    const metrics: number[] = run.metrics.map((m: RunMessageMetricDTO) => +m.value);
    for (const param of this.hyperParams) {
      const value = run.hyperParams[param];
      if (value) {
        data.push(value);
      } else {
        data.push('');
      }
    }
    if (this.mode === 'max') {
      data.push(Math.max(...metrics));
    }
    if (this.mode === 'min') {
      data.push(Math.min(...metrics));
    }
    if (this.mode === 'avg') {
      data.push(Math.max(...metrics) / metrics.length);
    }

    return data;

  }


  getChart(): EChartsOption {
    const lineStyle = {
      width: 1,
      opacity: 0.5
    };
    const parallelAxis = this.getParallelAxis();
    const data = this.formatData();
    const chartOption: EChartsOption = {
      title: {
        text: this.getName(),
        textStyle: {
          fontSize: 14,
          align: 'center',
        },
      },
      tooltip: {
        padding: 10,
        borderWidth: 1
      },
      parallelAxis: parallelAxis,
      visualMap: {
        show: true,
        precision: 2,
        min: this.getMinMetricValue(),
        max: this.getMaxMetricValue(),
        calculable: true,
        dimension: this.hyperParams.length,
        inRange: {
          color: ['#d94e5d', '#eac736', '#50a3ba'].reverse()
          // colorAlpha: [0, 1]
        }
      },
      parallel: {
        left: '5%',
        right: '18%',
        bottom: 100,
      },
      series: {
        type: 'parallel',
        data: data,
        lineStyle: lineStyle,
        emphasis: {
          focus: 'adjacency'
        },
      }

    } as any;
    return chartOption;
  }

}

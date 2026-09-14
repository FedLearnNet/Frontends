import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnChanges,
  OnInit,
  SimpleChanges,
  input
} from '@angular/core';
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from 'echarts/core';

import {EChartsOption} from "echarts";
import {ExperimentRunDTO} from "@shared-lib/modules/app-execution/dto/experiment";

@Component({
  selector: 'app-experiments-metric-parameter-heatmap',
  imports: [NgxEchartsDirective],
  templateUrl: './experiments-metric-parameter-heatmap.component.html',
  styleUrl: './experiments-metric-parameter-heatmap.component.scss',
  providers: [
    provideEchartsCore({echarts}),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentsMetricParameterHeatmapComponent implements OnInit, OnChanges {
  private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);

  readonly experimentRuns = input<ExperimentRunDTO[]>([]);

  randomId: string = Math.random().toString(36).substring(7);

  chartOption: EChartsOption = {};

  ngOnInit(): void {
    this.chartOption = this.getChart();
    this.changeDetectorRef.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["experimentRuns"]) {
      this.chartOption = this.getChart();
      this.changeDetectorRef.detectChanges();
    }
  }

  getChart(): EChartsOption {
    const metricHyperParamMap: { [key: string]: number[] } = {};

    // Prepare data for heatmap
    this.experimentRuns().forEach(run => {
      if (run.metrics) {
        run.metrics.forEach(metric => {
          for (const param in run.hyperParams) {
            const key = `${metric.metric}-${param}`;
            if (!metricHyperParamMap[key]) {
              metricHyperParamMap[key] = [];
            }
            metricHyperParamMap[key].push(parseFloat(metric.value));
          }
        });
      }
    });

    // Calculate average for each metric-hyperParam pair
    const heatmapData: [string, string, number][] = [];
    Object.keys(metricHyperParamMap).forEach(key => {
      const [metric, hyperParam] = key.split('-');
      const values = metricHyperParamMap[key];
      const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      heatmapData.push([metric, hyperParam, averageValue]);
    });

    // Create unique lists for axes
    const xAxisData = [...new Set(heatmapData.map(item => item[0]))];
    const yAxisData = [...new Set(heatmapData.map(item => item[1]))];

    // Format data for ECharts
    const formattedData = heatmapData.map(([metric, hyperParam, value]) => [metric, hyperParam, value.toFixed(2)]);
    return {
      tooltip: {
        position: 'top'
      },
      grid: {
        height: '50%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        splitArea: {
          show: true
        }
      },
      yAxis: {
        type: 'category',
        data: yAxisData,
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 1,
        precision: 2,
        calculable: true,
        inRange: {
          color: ['#d94e5d', '#eac736', '#50a3ba'].reverse()
          // colorAlpha: [0, 1]
        }
      },
      series: [{
        name: 'Metric-HyperParam Correlation',
        type: 'heatmap',
        data: formattedData,
        label: {
          show: true
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }
}

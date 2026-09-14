import {Component, input} from '@angular/core';
import {BaseChartDirective, provideCharts, withDefaultRegisterables} from "ng2-charts";

import {RunMessageMetricDTO} from "@shared-lib/modules/experiments/dto/log";

@Component({
    selector: 'app-simple-metric-line',
    providers: [provideCharts(withDefaultRegisterables())],
    imports: [BaseChartDirective],
    templateUrl: './simple-metric-line.component.html',
    styleUrl: './simple-metric-line.component.scss'
})
export class SimpleMetricLineComponent {

  readonly metrics = input<RunMessageMetricDTO[]>([]);
  readonly title = input<string>('Simple Metric Line');
  readonly height = input<number>();
  readonly width = input<number>();

  getChartOptions(): any {
    return {
      scales: {
        x: {
          title: {
            display: true,
            text: this.getXAxisLabel()
          }
        }
      }
    }
  }

  getXAxisLabel(): string {
    const metrics = this.metrics();
    if (metrics && metrics.length > 0) {
      return metrics[0].xUnit;
    }
    return '';
  }

  getChartData(): any {
    const metrics = this.metrics();
    if (metrics) {
      return {
        datasets: [
          {
            label: this.title(), data: metrics.map((d) => {
              return {y: d.value, x: d.x};
            })
          },
        ]
      };

    }
    return [];
  }
}

import {Component, Input} from '@angular/core';
import {BaseChartDirective, provideCharts, withDefaultRegisterables} from "ng2-charts";
import {CommonModule} from "@angular/common";
import {RunMessageMetricDTO} from "../../../../../dto/log";

@Component({
  selector: 'app-simple-metric-line',
  standalone: true,
  providers: [provideCharts(withDefaultRegisterables())],
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './simple-metric-line.component.html',
  styleUrl: './simple-metric-line.component.scss'
})
export class SimpleMetricLineComponent {

  @Input() metrics: RunMessageMetricDTO[] = [];
  @Input() title: string = 'Simple Metric Line';

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
    if (this.metrics && this.metrics.length > 0) {
      return this.metrics[0].xUnit;
    }
    return '';
  }

  getChartData(): any {
    if (this.metrics) {
      return {
        datasets: [
          {
            label: this.title, data: this.metrics.map((d) => {
              return {y: d.value, x: d.x};
            })
          },
        ]
      };

    }
    return [];
  }
}

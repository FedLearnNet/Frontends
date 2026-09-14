import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, input} from '@angular/core';
import {Observable} from "rxjs";
import {PerformanceDTO} from "../../../../dto/performance";

import {BaseChartDirective, provideCharts, withDefaultRegisterables} from "ng2-charts";
import {TranslatePipe} from "@ngx-translate/core";


@Component({
    selector: 'app-app-detail-monitor',
    providers: [provideCharts(withDefaultRegisterables())],
    imports: [
    BaseChartDirective,
    TranslatePipe
],
    templateUrl: './app-detail-monitor.component.html',
    styleUrl: './app-detail-monitor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppDetailMonitorComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly performance$ = input<Observable<PerformanceDTO>>(new Observable<PerformanceDTO>());


  performances: Map<string, PerformanceDTO[]> = new Map<string, PerformanceDTO[]>();

  ngOnInit(): void {
    this.performance$().subscribe((performance) => {
      if (!this.performances.has(performance.process)) {
        this.performances.set(performance.process, []);
      }
      const processPerformances = this.performances.get(performance.process);
      if (processPerformances) {
        processPerformances.push(performance);
        if (processPerformances.length > 50) {
          processPerformances.shift(); // Remove the oldest entry
        }
      }
      this.cdr.markForCheck();
    });

  }

  getPerformance(process: string): PerformanceDTO[] | undefined {
    return this.performances.get(process);
  }

  getProcessesNames(): string[] {
    return Array.from(this.performances.keys());
  }


  getChart(process: string): any {
    const cpuData = this.getChartData(process, 'cpu');
    const memoryData = this.getChartData(process, 'memory');
    return {
      datasets: [
        {label: 'CPU', data: cpuData},
        {label: 'Memory', data: memoryData}
      ]
    };

  }

  getChartOptions(title: string): any {
    return {
      animation: {
        duration: 0
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Usage in %"
          }
        },
        x: {
          title: {
            display: true,
            text: "Seconds since app start"
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: title
        }
      }

    }
  }

  getChartData(process: string, metric: string): any {
    const data = this.getPerformance(process);
    if (data) {
      return data.map((d) => {
        if (metric === 'cpu') {
          return {y: d.cpu, x: d.timestamp.toString()};
        }
        return {y: d.memory, x: d.timestamp.toString()};
      });
    }
    return [];
  }


}

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  signal,
  viewChild
} from '@angular/core';
import {PatientDataEntryDto} from "../../dto/patient";
import * as echarts from "echarts/core";
import {LineChart, ScatterChart} from "echarts/charts";
import {GridComponent, TooltipComponent} from "echarts/components";
import {SVGRenderer} from "echarts/renderers";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import {EChartsOption} from "echarts";

echarts.use([LineChart, ScatterChart, GridComponent, SVGRenderer, TooltipComponent])

@Component({
  selector: 'app-patient-data-sparkline',
  imports: [
    NgxEchartsDirective
  ],
  templateUrl: './patient-data-sparkline.component.html',
  styleUrl: './patient-data-sparkline.component.scss',
  providers: [provideEchartsCore({echarts})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDataSparklineComponent implements AfterViewInit {
  items = input.required<PatientDataEntryDto[]>();
  maxPoints = input<number>(24);
  showChart = input<boolean>(false);


  currentOption = signal<EChartsOption | null>(null);
  chartHost = viewChild<ElementRef<HTMLDivElement>>('chartWrap');
  initOptions = signal<object>({width: 500});
  chartRendering = signal<boolean>(false);

  constructor() {
    effect(() => {
      const data = this.items();

      queueMicrotask(() => this.updateOption(data));
    });
  }

  ngAfterViewInit() {
    const width = this.chartHost()?.nativeElement?.clientWidth;
    if (width) {
      this.initOptions.set({
        width: width,
      });
      this.chartRendering.set(true);
    }
  }

  private updateOption(items: PatientDataEntryDto[]): void {

    const pts = (items ?? [])
      .map(e => {
        const t = e.visitTimestamp ? new Date(e.visitTimestamp).getTime() : NaN;
        const v = typeof e.value === 'number' ? e.value : null;
        return {t, v};
      })
      .filter(p => Number.isFinite(p.t) && p.v !== null)
      .sort((a, b) => a.t - b.t);

    const last = pts.slice(-this.maxPoints());
    const seriesData = last.map(p => [p.t, p.v as number]);

    const option = {
      animation: false,
      xAxis: {
        type: 'time',
        boundaryGap: false,
        show: false,
      },
      yAxis: {
        type: 'value',
        scale: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {type: 'line', snap: true}
      },
      series: [
        {
          type: 'line',
          data: seriesData
        }
      ]
    };
    this.currentOption.set(option as any);
  }
}

import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {EChartsOption} from "echarts";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {CsvFileStatisticsField} from "@shared-lib/models/data-statistics";
import { CommonModule, DecimalPipe } from "@angular/common";
import {BarChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';
import {GridComponent, TooltipComponent} from "echarts/components";

echarts.use([BarChart, GridComponent, CanvasRenderer, TooltipComponent])

@Component({
  selector: 'lib-csv-file-statistics',
  imports: [
    CommonModule,
    DecimalPipe,
    NgxEchartsDirective
  ],
  templateUrl: './csv-file-statistics.component.html',
  styleUrl: './csv-file-statistics.component.scss',
  providers: [provideEchartsCore({echarts})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsvFileStatisticsComponent {
  statistics = input.required<CsvFileStatisticsField>();

  currentOption = computed(() => {
    const profile = this.statistics();
    return this.buildMiniHistogramOption(profile);
  });


  public buildMiniHistogramOption(h: CsvFileStatisticsField): EChartsOption {
    if (!h || !h.previewHistogram) {
      return {};
    }
    return {
      grid: {left: 0, right: 0, top: 5, bottom: 0},
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
      },
      xAxis: {type: 'category', show: false, data: h.previewHistogram!.bins.map((_, i) => i)},
      yAxis: {type: 'value', show: false},
      series: [{
        type: 'bar', data: h.previewHistogram!.bins, barWidth: '60%'
      }]
    };
  }

  protected readonly Object = Object;
}

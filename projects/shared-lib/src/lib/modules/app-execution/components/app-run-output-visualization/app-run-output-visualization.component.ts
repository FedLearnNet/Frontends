import {Component, computed, input, signal} from '@angular/core';
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from 'echarts/core';
import {ECharts} from 'echarts/core';
import {ECBasicOption} from "echarts/types/dist/shared";
import {BarChart, HeatmapChart, ScatterChart} from "echarts/charts";
import {GridComponent, LegendComponent, TitleComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {MatDivider} from "@angular/material/divider";
import {AppOutputVisualisations} from "@shared-lib/modules/app-execution/model/config";

echarts.use([
  BarChart,
  ScatterChart,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
  HeatmapChart]);

@Component({
  selector: 'lib-app-run-output-visualization',
  imports: [
    NgxEchartsDirective,
    MatDivider
  ],
  templateUrl: './app-run-output-visualization.component.html',
  styleUrl: './app-run-output-visualization.component.scss',
  providers: [provideEchartsCore({echarts})],
})
export class AppRunOutputVisualizationComponent {
  readonly appOutputVisualisations = input.required<AppOutputVisualisations>();
  readonly chartOptions = computed(() => {
    return this.appOutputVisualisations().visualisation as ECBasicOption | undefined;
  })

  private readonly echartsInstance = signal<ECharts | undefined>(undefined);

  onChartInit(ec: ECharts) {
    this.echartsInstance.set(ec);
  }
}

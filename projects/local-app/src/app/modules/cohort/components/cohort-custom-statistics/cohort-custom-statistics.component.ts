import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {BarChart, BoxplotChart, HeatmapChart, LineChart, PieChart, ScatterChart} from "echarts/charts";
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {CustomStatisticsService} from "@local-app/cohort/services/custom-statistics.service";
import {
  CustomStatisticDto,
  CustomStatisticType
} from "@local-app/cohort/dto/custom-statistics";
import {StatisticsColumnProfile} from "@local-app/cohort/dto/data-statistics";
import {
  CohortCustomStatisticsCreateDialogComponent,
  CohortCustomStatisticsCreateDialogData,
  CohortCustomStatisticsCreateDialogResult
} from "@local-app/cohort/components/cohort-custom-statistics-create-dialog/cohort-custom-statistics-create-dialog.component";
import {buildCustomStatisticOption} from "@local-app/cohort/components/cohort-custom-statistics/custom-statistic-chart-options";

echarts.use([
  BarChart, BoxplotChart, HeatmapChart, LineChart, PieChart, ScatterChart,
  DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent, VisualMapComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-cohort-custom-statistics',
  imports: [
    CommonModule,
    MatIconModule,
    NgxEchartsDirective,
    PageWrapperComponent,
    EmptyStateComponent,
    BtnComponent,
  ],
  templateUrl: './cohort-custom-statistics.component.html',
  styleUrl: './cohort-custom-statistics.component.scss',
  providers: [provideEchartsCore({echarts})],
})
export class CohortCustomStatisticsComponent {
  private readonly customStatisticsService: CustomStatisticsService = inject(CustomStatisticsService);
  private readonly dialog: MatDialog = inject(MatDialog);

  dashboardId = input<number | undefined>(undefined);
  properties = input<StatisticsColumnProfile[]>([]);

  readonly statistics = signal<CustomStatisticDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly hasStatistics = computed(() => this.statistics().length > 0);

  private readonly loadEffect = effect((onCleanup) => {
    const dashboardId = this.dashboardId();
    if (!dashboardId) {
      this.statistics.set([]);
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    const sub = this.customStatisticsService.list(dashboardId).subscribe({
      next: (items) => {
        this.statistics.set(items ?? []);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message ?? String(err));
        this.isLoading.set(false);
      },
    });
    onCleanup(() => sub.unsubscribe());
  });

  openCreateDialog(): void {
    const dashboardId = this.dashboardId();
    if (!dashboardId) return;
    const data: CohortCustomStatisticsCreateDialogData = {
      dashboardId,
      properties: this.properties(),
    };
    this.dialog
      .open<
        CohortCustomStatisticsCreateDialogComponent,
        CohortCustomStatisticsCreateDialogData,
        CohortCustomStatisticsCreateDialogResult
      >(CohortCustomStatisticsCreateDialogComponent, {
        data,
        width: '720px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((created) => {
        if (created) {
          this.statistics.update((existing) => [created, ...existing]);
        }
      });
  }

  remove(stat: CustomStatisticDto): void {
    this.customStatisticsService.delete(stat.id).subscribe(() => {
      this.statistics.update((items) => items.filter((item) => item.id !== stat.id));
    });
  }

  chartOption(stat: CustomStatisticDto): EChartsOption {
    return buildCustomStatisticOption(stat);
  }

  typeLabel(type: CustomStatisticType): string {
    switch (type) {
      case CustomStatisticType.BAR: return 'Bar';
      case CustomStatisticType.PIE: return 'Pie';
      case CustomStatisticType.LINE: return 'Line';
      case CustomStatisticType.SCATTER: return 'Scatter';
      case CustomStatisticType.HISTOGRAM: return 'Histogram';
      case CustomStatisticType.BOXPLOT: return 'Box plot';
      case CustomStatisticType.HEATMAP: return 'Heatmap';
    }
  }
}

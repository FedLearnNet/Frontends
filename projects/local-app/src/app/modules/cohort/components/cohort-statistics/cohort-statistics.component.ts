import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject, input, signal, viewChild} from '@angular/core';
import {MatChipsModule} from "@angular/material/chips";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectChange, MatSelectModule} from "@angular/material/select";
import {MatDividerModule} from "@angular/material/divider";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatMenuModule} from "@angular/material/menu";
import {MatDialog} from "@angular/material/dialog";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {BarChart, BoxplotChart} from "echarts/charts";
import {GridComponent, LegendComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {CohortStatisticsService} from "@local-app/cohort/services/cohort-statistics.service";
import {CustomStatisticsService} from "@local-app/cohort/services/custom-statistics.service";
import {
  LocalDataStatisticsDto,
  StatisticsCategoryEntry,
  StatisticsColumnProfile
} from "@local-app/cohort/dto/data-statistics";
import {CustomStatisticsDashboardDto} from "@local-app/cohort/dto/custom-statistics";
import {
  CohortStatisticsPropertyCardComponent
} from "@local-app/cohort/components/cohort-statistics-property-card/cohort-statistics-property-card.component";
import {
  CohortCustomStatisticsComponent
} from "@local-app/cohort/components/cohort-custom-statistics/cohort-custom-statistics.component";
import {
  CohortCustomStatisticsDashboardDialogComponent,
  CohortCustomStatisticsDashboardDialogData,
  CohortCustomStatisticsDashboardDialogResult
} from "@local-app/cohort/components/cohort-custom-statistics-dashboard-dialog/cohort-custom-statistics-dashboard-dialog.component";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {TranslatePipe} from "@ngx-translate/core";

echarts.use([BarChart, BoxplotChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-cohort-statistics',
  imports: [
    CommonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    NgxEchartsDirective,
    BadgeComponent,
    BtnComponent,
    CohortStatisticsPropertyCardComponent,
    CohortCustomStatisticsComponent,
    PageWrapperComponent,
    HeaderComponent,
    EmptyStateComponent,
    KvComponent,
    TranslatePipe
  ],
  templateUrl: './cohort-statistics.component.html',
  styleUrl: './cohort-statistics.component.scss',
  providers: [provideEchartsCore({echarts})]
})
export class CohortStatisticsComponent {
  private readonly cohortStatisticsService: CohortStatisticsService = inject(CohortStatisticsService);
  private readonly customStatisticsService: CustomStatisticsService = inject(CustomStatisticsService);
  private readonly dialog: MatDialog = inject(MatDialog);

  cohortId = input<number | undefined>(undefined);

  readonly statistics = signal<LocalDataStatisticsDto | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly selectedType = signal<string>('ALL');
  readonly sortMode = signal<'missing' | 'name' | 'type' | 'completeness'>('missing');
  readonly cardDensity = signal<'compact' | 'comfortable'>('compact');

  readonly dashboards = signal<CustomStatisticsDashboardDto[]>([]);
  readonly selectedDashboardId = signal<number | null>(null);


  readonly isProfileTab = computed(() => this.selectedDashboardId() === null);
  readonly selectedDashboard = computed(() =>
    this.dashboards().find(d => d.id === this.selectedDashboardId()) ?? null
  );

  private readonly customStatistics = viewChild(CohortCustomStatisticsComponent);

  private readonly loadDashboardsEffect = effect((onCleanup) => {
    const cohortId = this.cohortId();
    if (cohortId == null) {
      this.dashboards.set([]);
      return;
    }
    const sub = this.customStatisticsService.listDashboards(cohortId).subscribe({
      next: (items) => this.dashboards.set(items ?? []),
    });
    onCleanup(() => sub.unsubscribe());
  });

  selectProfile(): void {
    this.selectedDashboardId.set(null);
  }

  selectDashboard(dashboard: CustomStatisticsDashboardDto): void {
    this.selectedDashboardId.set(dashboard.id);
  }

  openCustomStatisticCreate(): void {
    this.customStatistics()?.openCreateDialog();
  }
  openNewDashboardDialog(): void {
    const cohortId = this.cohortId();
    if (cohortId == null) return;
    const data: CohortCustomStatisticsDashboardDialogData = {mode: 'CREATE'};
    this.dialog
      .open<
        CohortCustomStatisticsDashboardDialogComponent,
        CohortCustomStatisticsDashboardDialogData,
        CohortCustomStatisticsDashboardDialogResult
      >(CohortCustomStatisticsDashboardDialogComponent, {data, width: '420px'})
      .afterClosed()
      .subscribe((name) => {
        if (!name) return;
        this.customStatisticsService.createDashboard({cohortId, name}).subscribe((created) => {
          this.dashboards.update(items => [...items, created]);
          this.selectedDashboardId.set(created.id);
        });
      });
  }

  renameDashboard(): void {
    const dashboard = this.selectedDashboard();
    if (dashboard === null) {
      return;
    }
    const data: CohortCustomStatisticsDashboardDialogData = {
      mode: 'RENAME',
      initialName: dashboard.name,
    };
    this.dialog
      .open<
        CohortCustomStatisticsDashboardDialogComponent,
        CohortCustomStatisticsDashboardDialogData,
        CohortCustomStatisticsDashboardDialogResult
      >(CohortCustomStatisticsDashboardDialogComponent, {data, width: '420px'})
      .afterClosed()
      .subscribe((name) => {
        if (!name || name === dashboard.name) return;
        this.customStatisticsService.updateDashboard(dashboard.id, {...dashboard, name}).subscribe((updated) => {
          this.dashboards.update(items => items.map(item => item.id === updated.id ? updated : item));
        });
      });
  }

  deleteDashboard(): void {
    const dashboard = this.selectedDashboard();
    if (dashboard === null) {
      return;
    }
    this.dialog
      .open<ConfirmDialogComponent, unknown, boolean>(ConfirmDialogComponent, {
        data: {
          title: 'Delete dashboard',
          message: `Delete "${dashboard.name}" and all of its custom statistics?`,
          confirmButtonText: 'Delete',
          dismissButtonText: 'Cancel',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.customStatisticsService.deleteDashboard(dashboard.id).subscribe(() => {
          this.dashboards.update(items => items.filter(item => item.id !== dashboard.id));
          if (this.selectedDashboardId() === dashboard.id) {
            this.selectedDashboardId.set(null);
          }
        });
      });
  }

  readonly properties = computed(() => this.statistics()?.properties ?? []);
  readonly rowsScanned = computed(() => Math.max(0, ...this.properties().map(property => property.count ?? 0)));
  readonly totalMissing = computed(() => this.properties().reduce((sum, property) => sum + (property.missing ?? 0), 0));
  readonly availableTypeFilters = computed(() => ['ALL', ...Object.keys(this.typeCounts())]);
  readonly typeCounts = computed(() => {
    const counts: Record<string, number> = {};
    this.properties().forEach((property) => {
      const label = this.formatType(property.type);
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return counts;
  });
  readonly filteredProperties = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const selectedType = this.selectedType();
    const sortMode = this.sortMode();
    return this.properties()
      .filter(property => {
        const matchesSearch = !search
          || property.name.toLowerCase().includes(search)
          || this.formatType(property.type).toLowerCase().includes(search);
        const matchesType = selectedType === 'ALL' || this.formatType(property.type) === selectedType;
        return matchesSearch && matchesType;
      })
      .slice()
      .sort((a, b) => {
        if (sortMode === 'name') {
          return a.name.localeCompare(b.name);
        }

        if (sortMode === 'type') {
          return this.formatType(a.type).localeCompare(this.formatType(b.type)) || a.name.localeCompare(b.name);
        }

        if (sortMode === 'completeness') {
          const completenessDiff = this.getCompleteness(b) - this.getCompleteness(a);
          if (completenessDiff !== 0) {
            return completenessDiff;
          }
          return a.name.localeCompare(b.name);
        }

        const missingDiff = this.getMissingRate(b) - this.getMissingRate(a);
        if (missingDiff !== 0) {
          return missingDiff;
        }
        return a.name.localeCompare(b.name);
      });
  });
  readonly quickOverviewNumericProperties = computed(() =>
    this.filteredProperties()
      .filter(property => this.isNumeric(property.type) && this.hasBoxplotData(property))
      .slice(0, 6)
  );
  readonly quickOverviewCategoricalProperties = computed(() =>
    this.filteredProperties()
      .filter(property => !this.isNumeric(property.type) && this.hasCategories(property))
      .slice(0, 8)
  );
  readonly overviewChartOption = computed<EChartsOption>(() => {
    const entries = Object.entries(this.typeCounts());
    return {
      tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
      grid: {left: 40, right: 16, top: 16, bottom: 24},
      xAxis: {
        type: 'category',
        data: entries.map(([label]) => label)
      },
      yAxis: {type: 'value'},
      series: [{
        type: 'bar',
        data: entries.map(([, value]) => value),
        itemStyle: {color: '#1d4ed8', borderRadius: [8, 8, 0, 0]}
      }]
    };
  });
  readonly qualityChartOption = computed<EChartsOption>(() => {
    const numericItems = this.quickOverviewNumericProperties();
    const categoricalItems = this.quickOverviewCategoricalProperties();

    const RANK_COLORS = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed', '#0369a1', '#94a3b8'];
    const MAX_RANKS = 5;

    const getRankPcts = (property: StatisticsColumnProfile): number[] => {
      const total = Math.max(0, (property.count ?? 0) - (property.missing ?? 0));
      if (!total) {
        return Array(MAX_RANKS + 1).fill(0);
      }
      const sorted = this.normalizeTopCategories(property.topCategories)
        .map(([, count]) => count)
        .sort((a, b) => b - a);
      const topN = sorted.slice(0, MAX_RANKS);
      const topSum = topN.reduce((sum, value) => sum + value, 0);
      return [
        ...topN.map(value => parseFloat((value / total * 100).toFixed(1))),
        ...Array(MAX_RANKS - topN.length).fill(0),
        parseFloat((Math.max(0, total - topSum) / total * 100).toFixed(1))
      ];
    };

    return {
      tooltip: {trigger: 'axis', confine: true},
      legend: {bottom: 0, type: 'scroll'},
      grid: [
        {left: 56, right: 20, top: 16, height: '36%'},
        {left: 56, right: 20, top: '58%', height: '28%', bottom: 32}
      ],
      xAxis: [
        {
          type: 'category',
          gridIndex: 0,
          data: numericItems.map(item => this.shorten(item.name, 14)),
          axisLabel: {interval: 0, rotate: 18}
        },
        {
          type: 'category',
          gridIndex: 1,
          data: categoricalItems.map(item => this.shorten(item.name, 14)),
          axisLabel: {interval: 0, rotate: 18}
        }
      ],
      yAxis: [
        {type: 'value', gridIndex: 0, scale: true},
        {
          type: 'value',
          gridIndex: 1,
          min: 0,
          max: 100,
          axisLabel: {formatter: (value: number) => `${value}%`}
        }
      ],
      series: [
        {
          type: 'boxplot',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: numericItems.map(item => [item.min!, item.p25!, item.median!, item.p75!, item.max!]),
          itemStyle: {color: '#bfdbfe', borderColor: '#1d4ed8', borderWidth: 1.5}
        },
        ...Array.from({length: MAX_RANKS}, (_, i) => ({
          name: `Rank ${i + 1}`,
          type: 'bar' as const,
          stack: 'categories',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: categoricalItems.map(item => getRankPcts(item)[i]),
          itemStyle: {color: RANK_COLORS[i]}
        })),
        {
          name: 'Others',
          type: 'bar' as const,
          stack: 'categories',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: categoricalItems.map(item => getRankPcts(item)[MAX_RANKS]),
          itemStyle: {color: RANK_COLORS[MAX_RANKS]}
        }
      ]
    };
  });

  private readonly loadEffect = effect((onCleanup) => {
    const cohortId = this.cohortId();
    if (cohortId == null) {
      this.statistics.set(null);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const sub = this.cohortStatisticsService.getStatisticsForCohort(cohortId).subscribe({
      next: (statistics) => {
        this.statistics.set(statistics);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message ?? String(error));
        this.isLoading.set(false);
      }
    });

    onCleanup(() => sub.unsubscribe());
  });

  updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value ?? '');
  }

  setTypeFilter(filter: string): void {
    this.selectedType.set(filter);
  }

  updateSortMode(event: MatSelectChange): void {
    this.sortMode.set(event.value);
  }

  updateDensity(event: MatSelectChange): void {
    this.cardDensity.set(event.value);
  }

  formatType(type: string): string {
    const upper = (type ?? '').toUpperCase();
    switch (upper) {
      case 'INTEGER':
        return 'Integer';
      case 'NUMBER':
        return 'Number';
      case 'BOOLEAN':
        return 'Boolean';
      case 'DATETIME':
        return 'Datetime';
      case 'TEXT':
        return 'Text';
      default:
        return upper || 'Unknown';
    }
  }

  typeColor(type: string): 'BLUE' | 'GREEN' | 'ORANGE' | 'GRAY' {
    const upper = (type ?? '').toUpperCase();
    if (upper === 'INTEGER' || upper === 'NUMBER') {
      return 'BLUE';
    }
    if (upper === 'BOOLEAN') {
      return 'GREEN';
    }
    if (upper === 'DATETIME') {
      return 'ORANGE';
    }
    return 'GRAY';
  }

  getMissingRate(property: StatisticsColumnProfile): number {
    const count = property.count || 0;
    if (!count) {
      return 0;
    }
    return property.missing / count;
  }

  getCompleteness(property: StatisticsColumnProfile): number {
    return 1 - this.getMissingRate(property);
  }

  shorten(value: string, limit = 20): string {
    if (value.length <= limit) {
      return value;
    }
    return `${value.slice(0, limit - 1)}…`;
  }

  private hasBoxplotData(property: StatisticsColumnProfile): boolean {
    return property.min != null
      && property.p25 != null
      && property.median != null
      && property.p75 != null
      && property.max != null;
  }

  private isNumeric(type: string): boolean {
    const upper = (type ?? '').toUpperCase();
    return upper === 'INTEGER' || upper === 'NUMBER';
  }

  private hasCategories(property: StatisticsColumnProfile): boolean {
    return this.normalizeTopCategories(property.topCategories).length > 0;
  }

  private normalizeTopCategories(categories?: StatisticsCategoryEntry[] | null): Array<[string, number]> {
    if (!categories?.length) {
      return [];
    }

    const result: Array<[string, number]> = [];
    for (const entry of categories) {
      if (Array.isArray(entry)) {
        result.push([String(entry[0]), Number(entry[1] ?? 0)]);
        continue;
      }

      const typed = entry as { key?: string; value?: number; count?: number; name?: string };
      const label = typed.key ?? typed.name;
      const value = typed.value ?? typed.count;
      if (label != null && value != null) {
        result.push([String(label), Number(value)]);
        continue;
      }

      for (const [k, v] of Object.entries(entry as Record<string, unknown>)) {
        if (typeof v === 'number') {
          result.push([k, v]);
        }
      }
    }
    return result;
  }
}

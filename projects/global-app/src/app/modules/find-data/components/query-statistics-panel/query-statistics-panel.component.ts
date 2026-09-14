import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject, input, output, signal} from '@angular/core';
import {MatChipsModule} from "@angular/material/chips";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectChange, MatSelectModule} from "@angular/material/select";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {BarChart, BoxplotChart} from "echarts/charts";
import {GridComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {QueryDTO} from "@global-app/find-data/dto/query";
import {DataStatisticsResponseDTO, StatisticsCategoryEntry, StatisticsColumnProfile} from "@global-app/find-data/dto/query-statistics";
import {QueryStatisticsResponseService} from "@global-app/find-data/services/query-statistics-response.service";
import {
  QueryStatisticsPropertyCompareCardComponent
} from "@global-app/find-data/components/query-statistics-property-compare-card/query-statistics-property-compare-card.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {TranslatePipe} from "@ngx-translate/core";

echarts.use([BarChart, BoxplotChart, GridComponent, TooltipComponent, CanvasRenderer]);

interface PropertyComparisonGroup {
  propertyName: string;
  type: string;
  clinics: Array<{
    clinicId: string;
    profile: StatisticsColumnProfile;
  }>;
}

@Component({
  selector: 'app-query-statistics-panel',
  imports: [
    CommonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    NgxEchartsDirective,
    BadgeComponent,
    TimeBadgeComponent,
    QueryStatisticsPropertyCompareCardComponent,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    TranslatePipe
  ],
  templateUrl: './query-statistics-panel.component.html',
  styleUrl: './query-statistics-panel.component.scss',
  providers: [provideEchartsCore({echarts})]
})
export class QueryStatisticsPanelComponent {
  private readonly statisticsService = inject(QueryStatisticsResponseService);

  query = input.required<QueryDTO>();

  request = output<void>();

  readonly responses = signal<DataStatisticsResponseDTO[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly selectedType = signal<string>('ALL');
  readonly sortMode = signal<'coverage' | 'missing' | 'name' | 'type'>('coverage');
  readonly cardDensity = signal<'compact' | 'comfortable'>('compact');
  private readonly reloadTrigger = signal(0);

  readonly isPending = computed(() =>
    !!this.query().latestDataStatisticsRequest && this.responses().length === 0
  );

  readonly clinicCount = computed(() => new Set(this.responses().map(response => response.randomClinicId)).size);
  readonly typeCounts = computed(() => {
    const counts: Record<string, number> = {};
    this.comparisonGroups().forEach((group) => {
      const label = this.formatType(group.type);
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return counts;
  });

  isEmpty = computed(() => this.filteredGroups().length === 0 || this.clinicCount() === 0);
  readonly availableTypeFilters = computed(() => ['ALL', ...Object.keys(this.typeCounts())]);
  readonly comparisonGroups = computed<PropertyComparisonGroup[]>(() => {
    const groups = new Map<string, PropertyComparisonGroup>();

    this.responses().forEach((response) => {
      response.statistics?.properties?.forEach((property) => {
        const existing = groups.get(property.name);
        if (existing) {
          existing.clinics.push({
            clinicId: response.randomClinicId,
            profile: property
          });
          return;
        }

        groups.set(property.name, {
          propertyName: property.name,
          type: property.type,
          clinics: [{
            clinicId: response.randomClinicId,
            profile: property
          }]
        });
      });
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (b.clinics.length !== a.clinics.length) {
        return b.clinics.length - a.clinics.length;
      }
      return a.propertyName.localeCompare(b.propertyName);
    });
  });

  readonly filteredGroups = computed(() => {
    const search = this.search().trim().toLowerCase();
    const selectedType = this.selectedType();
    const sortMode = this.sortMode();

    return this.comparisonGroups()
      .filter(group => {
        const formattedType = this.formatType(group.type);
        const matchesSearch = !search
          || group.propertyName.toLowerCase().includes(search)
          || formattedType.toLowerCase().includes(search);
        const matchesType = selectedType === 'ALL' || formattedType === selectedType;
        return matchesSearch && matchesType;
      })
      .slice()
      .sort((a, b) => {
        if (sortMode === 'name') {
          return a.propertyName.localeCompare(b.propertyName);
        }

        if (sortMode === 'type') {
          return this.formatType(a.type).localeCompare(this.formatType(b.type))
            || a.propertyName.localeCompare(b.propertyName);
        }

        if (sortMode === 'missing') {
          const missingDiff = this.averageMissingRate(b) - this.averageMissingRate(a);
          if (missingDiff !== 0) {
            return missingDiff;
          }
          return a.propertyName.localeCompare(b.propertyName);
        }

        const coverageDiff = b.clinics.length - a.clinics.length;
        if (coverageDiff !== 0) {
          return coverageDiff;
        }
        return a.propertyName.localeCompare(b.propertyName);
      });
  });
  readonly overviewChartOption = computed<EChartsOption>(() => {
    const numericGroups = this.filteredGroups()
      .filter(group => this.isNumeric(group.type) && this.hasAverageBoxData(group))
      .slice(0, 6);
    const categoricalGroups = this.filteredGroups()
      .filter(group => !this.isNumeric(group.type) && this.hasCategories(group))
      .slice(0, 8);

    const RANK_COLORS = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed', '#0369a1', '#94a3b8'];
    const MAX_RANKS = 5;

    const getRankPcts = (group: PropertyComparisonGroup): number[] => {
      const counts = new Map<string, number>();
      let total = 0;
      group.clinics.forEach(({profile}) => {
        this.normalizeTopCategories(profile.topCategories).forEach(([lbl, c]) => {
          counts.set(lbl, (counts.get(lbl) ?? 0) + c);
        });
        total += Math.max(0, (profile.count ?? 0) - (profile.missing ?? 0));
      });
      if (!total) {
        return Array(MAX_RANKS + 1).fill(0);
      }
      const sorted = Array.from(counts.values()).sort((a, b) => b - a);
      const topN = sorted.slice(0, MAX_RANKS);
      const topSum = topN.reduce((s, v) => s + v, 0);
      return [
        ...topN.map(v => parseFloat((v / total * 100).toFixed(1))),
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
          data: numericGroups.map(group => this.shorten(group.propertyName, 14)),
          axisLabel: {interval: 0, rotate: 18}
        },
        {
          type: 'category',
          gridIndex: 1,
          data: categoricalGroups.map(group => this.shorten(group.propertyName, 14)),
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
          data: numericGroups.map(group => this.averageBoxData(group)!),
          itemStyle: {color: '#bfdbfe', borderColor: '#1d4ed8', borderWidth: 1.5}
        },
        ...Array.from({length: MAX_RANKS}, (_, i) => ({
          name: `Rank ${i + 1}`,
          type: 'bar' as const,
          stack: 'categories',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: categoricalGroups.map(group => getRankPcts(group)[i]),
          itemStyle: {color: RANK_COLORS[i]}
        })),
        {
          name: 'Others',
          type: 'bar' as const,
          stack: 'categories',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: categoricalGroups.map(group => getRankPcts(group)[MAX_RANKS]),
          itemStyle: {color: RANK_COLORS[MAX_RANKS]}
        }
      ]
    };
  });

  private readonly pollEffect = effect((onCleanup) => {
    if (!this.isPending()) return;
    const timer = setInterval(() => {
      if (this.isPending()) {
        this.reloadTrigger.update(v => v + 1);
      }
    }, 15000);
    onCleanup(() => clearInterval(timer));
  });

  private readonly loadEffect = effect((onCleanup) => {
    const query = this.query();
    this.reloadTrigger();
    if (!query?.id) {
      this.responses.set([]);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const source$ = query.latestDataStatisticsRequest
      ? this.statisticsService.listForRequest(query.latestDataStatisticsRequest)
      : this.statisticsService.listForQuery(query.id);

    const sub = source$.subscribe({
      next: (responses) => {
        this.responses.set(responses ?? []);
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
    this.search.set((event.target as HTMLInputElement).value ?? '');
  }

  updateSortMode(event: MatSelectChange): void {
    this.sortMode.set(event.value);
  }

  updateDensity(event: MatSelectChange): void {
    this.cardDensity.set(event.value);
  }

  setTypeFilter(filter: string): void {
    this.selectedType.set(filter);
  }

  private isNumeric(type: string): boolean {
    const upper = (type ?? '').toUpperCase();
    return upper === 'INTEGER' || upper === 'NUMBER';
  }

  private formatType(type: string): string {
    return (type ?? 'UNKNOWN').toUpperCase();
  }

  private hasAverageBoxData(group: PropertyComparisonGroup): boolean {
    return group.clinics.some(item =>
      item.profile.min != null
      && item.profile.p25 != null
      && item.profile.median != null
      && item.profile.p75 != null
      && item.profile.max != null
    );
  }

  private averageBoxData(group: PropertyComparisonGroup): number[] | null {
    const profiles = group.clinics
      .map(item => item.profile)
      .filter(profile =>
        profile.min != null
        && profile.p25 != null
        && profile.median != null
        && profile.p75 != null
        && profile.max != null
      );

    if (!profiles.length) {
      return null;
    }

    const avg = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    return [
      avg(profiles.map(profile => profile.min!)),
      avg(profiles.map(profile => profile.p25!)),
      avg(profiles.map(profile => profile.median!)),
      avg(profiles.map(profile => profile.p75!)),
      avg(profiles.map(profile => profile.max!)),
    ];
  }

  private averageMissingRate(group: PropertyComparisonGroup): number {
    if (!group.clinics.length) {
      return 0;
    }
    return group.clinics.reduce((sum, item) => {
      const count = item.profile.count || 0;
      if (!count) {
        return sum;
      }
      return sum + (item.profile.missing / count);
    }, 0) / group.clinics.length;
  }

  private hasCategories(group: PropertyComparisonGroup): boolean {
    return group.clinics.some(({profile}) => this.normalizeTopCategories(profile.topCategories).length > 0);
  }

  private topCategoryPercent(group: PropertyComparisonGroup): number | null {
    const counts = new Map<string, number>();
    let totalNonMissing = 0;

    group.clinics.forEach(({profile}) => {
      this.normalizeTopCategories(profile.topCategories).forEach(([label, count]) => {
        counts.set(label, (counts.get(label) ?? 0) + count);
      });
      totalNonMissing += Math.max(0, (profile.count ?? 0) - (profile.missing ?? 0));
    });

    if (!counts.size || !totalNonMissing) {
      return null;
    }

    const topCount = Math.max(...Array.from(counts.values()));
    return parseFloat((topCount / totalNonMissing * 100).toFixed(1));
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

      const typed = entry as {key?: string; value?: number; count?: number; name?: string};
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

  private shorten(value: string, limit = 18): string {
    if (value.length <= limit) {
      return value;
    }
    return `${value.slice(0, limit - 1)}…`;
  }
}

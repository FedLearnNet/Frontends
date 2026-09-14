import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {MatButtonToggleChange, MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatDialog} from "@angular/material/dialog";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {BarChart, BoxplotChart, LineChart} from "echarts/charts";
import {GridComponent, LegendComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {StatisticsCategoryEntry, StatisticsColumnProfile} from "@global-app/find-data/dto/query-statistics";
import {
  QueryStatisticsPropertyDetailDialogComponent
} from "@global-app/find-data/components/query-statistics-property-detail-dialog/query-statistics-property-detail-dialog.component";

echarts.use([BarChart, BoxplotChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const CATEGORY_COLORS = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed', '#0369a1', '#94a3b8'];

interface ClinicPropertyProfile {
  clinicId: string;
  profile: StatisticsColumnProfile;
}

@Component({
  selector: 'app-query-statistics-property-compare-card',
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
    NgxEchartsDirective,
    BadgeComponent
  ],
  templateUrl: './query-statistics-property-compare-card.component.html',
  styleUrl: './query-statistics-property-compare-card.component.scss',
  providers: [provideEchartsCore({echarts})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueryStatisticsPropertyCompareCardComponent {
  private readonly dialog = inject(MatDialog);

  propertyName = input.required<string>();
  clinicProfiles = input.required<ClinicPropertyProfile[]>();
  density = input<'compact' | 'comfortable'>('compact');

  readonly viewMode = signal<'summary' | 'clinics'>('summary');

  readonly type = computed(() => this.clinicProfiles()[0]?.profile.type ?? 'UNKNOWN');
  readonly clinicCount = computed(() => this.clinicProfiles().length);
  readonly averageMean = computed(() => {
    const means = this.clinicProfiles()
      .map(item => item.profile.mean)
      .filter((value): value is number => value != null && !Number.isNaN(value));

    if (!means.length) {
      return null;
    }
    return means.reduce((sum, value) => sum + value, 0) / means.length;
  });
  readonly averageMissingRate = computed(() => {
    const rates = this.clinicProfiles()
      .map(item => this.getMissingRate(item.profile))
      .filter(value => !Number.isNaN(value));

    if (!rates.length) {
      return 0;
    }
    return rates.reduce((sum, value) => sum + value, 0) / rates.length;
  });
  readonly averageBox = computed(() => this.buildAverageBoxData());
  readonly averageCategorySeries = computed(() => this.buildAverageCategorySeries());
  readonly chartOption = computed<EChartsOption>(() => this.viewMode() === 'clinics'
    ? this.buildClinicComparisonChartOption()
    : this.buildSummaryChartOption());
  readonly aggregatedTopCategories = computed(() => {
    const counts = new Map<string, number>();
    let totalNonMissing = 0;

    this.clinicProfiles().forEach(({profile}) => {
      this.normalizeTopCategories(profile.topCategories).forEach(([label, count]) => {
        counts.set(label, (counts.get(label) ?? 0) + count);
      });
      totalNonMissing += Math.max(0, (profile.count ?? 0) - (profile.missing ?? 0));
    });

    const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topSum = top.reduce((sum, [, v]) => sum + v, 0);
    const others = totalNonMissing - topSum;

    if (others > 0) {
      top.push(['Others', others]);
    }

    return top;
  });

  readonly topCategory = computed(() => {
    const top = this.aggregatedTopCategories();
    return top.length && top[0][0] !== 'Others' ? this.shorten(top[0][0], 12) : null;
  });

  readonly isTextType = computed(() => !this.isNumeric(this.type()));

  typeColor(): 'BLUE' | 'GREEN' | 'ORANGE' | 'GRAY' {
    const upper = this.type().toUpperCase();
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

  setViewMode(event: MatButtonToggleChange): void {
    this.viewMode.set(event.value);
  }

  openDetail(): void {
    this.dialog.open(QueryStatisticsPropertyDetailDialogComponent, {
      data: {
        propertyName: this.propertyName(),
        clinicProfiles: this.clinicProfiles()
      },
      width: '92vw',
      maxWidth: '1400px',
      height: '88vh',
      autoFocus: false
    });
  }

  private buildClinicComparisonChartOption(): EChartsOption {
    if (this.isNumeric(this.type()) && this.hasBoxPlotData()) {
      const categories = [
        ...this.clinicProfiles().map(item => this.shorten(item.clinicId, 16)),
        'Average'
      ];
      const averageBox = this.averageBox();
      const meanAverage = this.averageMean();

      return {
        tooltip: {trigger: 'item', confine: true},
        legend: {bottom: 0},
        grid: {left: 48, right: 20, top: 20, bottom: 48},
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {interval: 0, rotate: 18}
        },
        yAxis: {type: 'value', scale: true},
        series: [
          {
            name: 'Distribution',
            type: 'boxplot',
            data: [
              ...this.clinicProfiles().map(item => [
                item.profile.min!,
                item.profile.p25!,
                item.profile.median!,
                item.profile.p75!,
                item.profile.max!
              ]),
              ...(averageBox ? [averageBox] : [])
            ],
            itemStyle: {
              color: '#bfdbfe',
              borderColor: '#1d4ed8',
              borderWidth: 1.5
            }
          },
          {
            name: 'Clinic mean',
            type: 'line',
            smooth: true,
            data: [
              ...this.clinicProfiles().map(item => item.profile.mean ?? null),
              meanAverage
            ],
            itemStyle: {color: '#0f766e'},
            lineStyle: {color: '#0f766e', width: 2}
          },
          {
            name: 'Average mean',
            type: 'line',
            smooth: true,
            data: categories.map(() => meanAverage),
            itemStyle: {color: '#ea580c'},
            lineStyle: {color: '#ea580c', width: 2, type: 'dashed'}
          }
        ]
      };
    }

    if (this.hasCategories()) {
      const cats = this.aggregatedTopCategories();
      const clinicLabels = [
        ...this.clinicProfiles().map(item => this.shorten(item.clinicId, 16)),
        'Average'
      ];

      const getClinicPct = (profile: StatisticsColumnProfile, category: string): number => {
        const total = Math.max(1, (profile.count ?? 0) - (profile.missing ?? 0));
        if (category === 'Others') {
          const topSum = this.normalizeTopCategories(profile.topCategories).reduce((s, [, c]) => s + c, 0);
          return parseFloat((Math.max(0, total - topSum) / total * 100).toFixed(1));
        }
        const entry = this.normalizeTopCategories(profile.topCategories).find(([lbl]) => lbl === category);
        return entry ? parseFloat((entry[1] / total * 100).toFixed(1)) : 0;
      };

      return {
        tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}, confine: true},
        legend: {bottom: 0, type: 'scroll'},
        grid: {left: 48, right: 20, top: 20, bottom: 64},
        xAxis: {type: 'category', data: clinicLabels, axisLabel: {interval: 0, rotate: 18}},
        yAxis: {type: 'value', min: 0, max: 100, axisLabel: {formatter: (v: number) => `${v}%`}},
        series: cats.map(([category], index) => {
          const perClinic = this.clinicProfiles().map(({profile}) => getClinicPct(profile, category));
          const avgPct = parseFloat((perClinic.reduce((s, v) => s + v, 0) / Math.max(1, perClinic.length)).toFixed(1));
          return {
            name: this.shorten(category, 16),
            type: 'bar',
            stack: 'categories',
            data: [...perClinic, avgPct],
            itemStyle: {color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
          };
        })
      };
    }

    return {
      tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}, confine: true},
      grid: {left: 48, right: 20, top: 20, bottom: 40},
      xAxis: {
        type: 'category',
        data: [
          ...this.clinicProfiles().map(item => this.shorten(item.clinicId, 16)),
          'Average'
        ],
        axisLabel: {interval: 0, rotate: 18}
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: (value: number) => `${value}%`
        }
      },
      series: [{
        type: 'bar',
        data: [
          ...this.clinicProfiles().map(item => Number((this.getMissingRate(item.profile) * 100).toFixed(1))),
          Number((this.averageMissingRate() * 100).toFixed(1))
        ],
        itemStyle: {color: '#64748b', borderRadius: [8, 8, 0, 0]}
      }]
    };
  }

  private buildSummaryChartOption(): EChartsOption {
    if (this.isNumeric(this.type()) && this.averageBox()) {
      return {
        tooltip: {trigger: 'item', confine: true},
        grid: {left: 48, right: 20, top: 20, bottom: 40},
        xAxis: {
          type: 'category',
          data: ['Average distribution']
        },
        yAxis: {type: 'value', scale: true},
        series: [{
          name: 'Average',
          type: 'boxplot',
          data: [this.averageBox()!],
          itemStyle: {
            color: '#bfdbfe',
            borderColor: '#1d4ed8',
            borderWidth: 1.5
          }
        }]
      };
    }

    if (this.hasCategories()) {
      const cats = this.aggregatedTopCategories();
      const total = cats.reduce((sum, [, v]) => sum + v, 0);
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {type: 'shadow'},
          confine: true,
          formatter: (params: any) =>
            (params as any[]).map(p => `${p.marker}${p.seriesName}: ${p.value}%`).join('<br/>')
        },
        legend: {bottom: 0, type: 'scroll'},
        grid: {left: 20, right: 20, top: 20, bottom: 56},
        xAxis: {type: 'value', min: 0, max: 100, axisLabel: {formatter: (v: number) => `${v}%`}},
        yAxis: {type: 'category', data: ['Distribution']},
        series: cats.map(([label, value], index) => ({
          name: this.shorten(label, 20),
          type: 'bar',
          stack: 'dist',
          data: [total > 0 ? parseFloat((value / total * 100).toFixed(1)) : 0],
          itemStyle: {color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
        }))
      };
    }

    return {
      tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}, confine: true},
      grid: {left: 48, right: 20, top: 20, bottom: 40},
      xAxis: {
        type: 'category',
        data: ['Average missingness']
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: (value: number) => `${value}%`
        }
      },
      series: [{
        type: 'bar',
        data: [Number((this.averageMissingRate() * 100).toFixed(1))],
        itemStyle: {color: '#64748b', borderRadius: [8, 8, 0, 0]}
      }]
    };
  }

  private buildAverageBoxData(): number[] | null {
    const profiles = this.clinicProfiles()
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

    const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    return [
      average(profiles.map(profile => profile.min!)),
      average(profiles.map(profile => profile.p25!)),
      average(profiles.map(profile => profile.median!)),
      average(profiles.map(profile => profile.p75!)),
      average(profiles.map(profile => profile.max!))
    ];
  }

  private buildAverageCategorySeries(): Map<string, number> {
    const counts = new Map<string, number[]>();
    this.clinicProfiles().forEach(({profile}) => {
      this.normalizeTopCategories(profile.topCategories).forEach(([label, count]) => {
        counts.set(label, [...(counts.get(label) ?? []), count]);
      });
    });

    return new Map(
      Array.from(counts.entries()).map(([label, values]) => [
        label,
        values.reduce((sum, value) => sum + value, 0) / values.length
      ])
    );
  }

  private hasBoxPlotData(): boolean {
    return this.clinicProfiles().some(item =>
      item.profile.min != null
      && item.profile.p25 != null
      && item.profile.median != null
      && item.profile.p75 != null
      && item.profile.max != null
    );
  }

  private hasCategories(): boolean {
    return this.clinicProfiles().some(item => this.normalizeTopCategories(item.profile.topCategories).length > 0);
  }

  private isNumeric(type: string): boolean {
    const upper = (type ?? '').toUpperCase();
    return upper === 'INTEGER' || upper === 'NUMBER';
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

      // Handle {"CategoryName": count} format
      for (const [k, v] of Object.entries(entry as Record<string, unknown>)) {
        if (typeof v === 'number') {
          result.push([k, v]);
        }
      }
    }
    return result;
  }

  private getMissingRate(profile: StatisticsColumnProfile): number {
    const count = profile.count || 0;
    if (!count) {
      return 0;
    }
    return profile.missing / count;
  }

  private shorten(value: string, limit = 18): string {
    if (value.length <= limit) {
      return value;
    }
    return `${value.slice(0, limit - 1)}…`;
  }
}

import {CommonModule} from '@angular/common';
import {Component, computed, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {BarChart, BoxplotChart, LineChart} from "echarts/charts";
import {GridComponent, LegendComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {StatisticsCategoryEntry, StatisticsColumnProfile} from "@global-app/find-data/dto/query-statistics";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

echarts.use([BarChart, BoxplotChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const CATEGORY_COLORS = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed', '#0369a1', '#94a3b8'];

interface ClinicPropertyProfile {
  clinicId: string;
  profile: StatisticsColumnProfile;
}

interface QueryStatisticsPropertyDetailDialogData {
  propertyName: string;
  clinicProfiles: ClinicPropertyProfile[];
}

interface DeviationRow {
  clinicId: string;
  mean: number | null;
  median: number | null;
  missingRate: number;
  deltaToAverage: number;
}

@Component({
  selector: 'app-query-statistics-property-detail-dialog',
  imports: [
    CommonModule,
    MatDialogContent,
    NgxEchartsDirective,
    CloseableDialogTitleComponent,
    BadgeComponent,
    HeaderComponent
  ],
  templateUrl: './query-statistics-property-detail-dialog.component.html',
  styleUrl: './query-statistics-property-detail-dialog.component.scss',
  providers: [provideEchartsCore({echarts})]
})
export class QueryStatisticsPropertyDetailDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<QueryStatisticsPropertyDetailDialogComponent>);
  readonly data = inject<QueryStatisticsPropertyDetailDialogData>(MAT_DIALOG_DATA);

  readonly type = computed(() => this.data.clinicProfiles[0]?.profile.type ?? 'UNKNOWN');
  readonly averageMean = computed(() => {
    const means = this.data.clinicProfiles
      .map(item => item.profile.mean)
      .filter((value): value is number => value != null && !Number.isNaN(value));

    if (!means.length) {
      return null;
    }
    return means.reduce((sum, value) => sum + value, 0) / means.length;
  });
  readonly averageMissingRate = computed(() => {
    if (!this.data.clinicProfiles.length) {
      return 0;
    }
    return this.data.clinicProfiles.reduce((sum, item) => sum + this.getMissingRate(item.profile), 0)
      / this.data.clinicProfiles.length;
  });
  readonly averageBox = computed(() => this.buildAverageBoxData());
  readonly topCategoryAverages = computed(() => this.buildAverageCategorySeries());
  readonly aggregatedTopCategories = computed(() => {
    const counts = new Map<string, number>();
    let totalNonMissing = 0;

    this.data.clinicProfiles.forEach(({profile}) => {
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
  readonly deviationRows = computed<DeviationRow[]>(() => {
    const averageMean = this.averageMean();
    const averageMissing = this.averageMissingRate();

    return this.data.clinicProfiles
      .map(({clinicId, profile}) => ({
        clinicId,
        mean: profile.mean ?? null,
        median: profile.median ?? null,
        missingRate: this.getMissingRate(profile),
        deltaToAverage: this.isNumeric(this.type()) && averageMean != null && profile.mean != null
          ? profile.mean - averageMean
          : this.getMissingRate(profile) - averageMissing
      }))
      .sort((a, b) => Math.abs(b.deltaToAverage) - Math.abs(a.deltaToAverage));
  });
  readonly strongestDeviation = computed(() => this.deviationRows()[0] ?? null);
  readonly comparisonChartOption = computed<EChartsOption>(() => this.buildComparisonChartOption());
  readonly deviationChartOption = computed<EChartsOption>(() => this.buildDeviationChartOption());

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('92vw', '88vh');
    }
  }

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

  deviationLabel(): string {
    return this.isNumeric(this.type()) ? 'Mean delta vs average' : 'Missingness delta vs average';
  }

  private buildComparisonChartOption(): EChartsOption {
    if (this.isNumeric(this.type()) && this.averageBox()) {
      const categories = [
        ...this.data.clinicProfiles.map(item => this.shorten(item.clinicId, 18)),
        'Average'
      ];
      return {
        tooltip: {trigger: 'item', confine: true},
        legend: {bottom: 0},
        grid: {left: 56, right: 20, top: 20, bottom: 56},
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
              ...this.data.clinicProfiles.map(item => [
                item.profile.min!,
                item.profile.p25!,
                item.profile.median!,
                item.profile.p75!,
                item.profile.max!
              ]),
              this.averageBox()!
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
            data: [...this.data.clinicProfiles.map(item => item.profile.mean ?? null), this.averageMean()],
            itemStyle: {color: '#0f766e'},
            lineStyle: {color: '#0f766e', width: 2}
          },
          {
            name: 'Average mean',
            type: 'line',
            smooth: true,
            data: categories.map(() => this.averageMean()),
            itemStyle: {color: '#ea580c'},
            lineStyle: {color: '#ea580c', width: 2, type: 'dashed'}
          }
        ]
      };
    }

    const cats = this.aggregatedTopCategories();

    if (cats.length) {
      const clinicLabels = [
        ...this.data.clinicProfiles.map(item => this.shorten(item.clinicId, 18)),
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
        grid: {left: 56, right: 20, top: 20, bottom: 64},
        xAxis: {type: 'category', data: clinicLabels, axisLabel: {interval: 0, rotate: 18}},
        yAxis: {type: 'value', min: 0, max: 100, axisLabel: {formatter: (v: number) => `${v}%`}},
        series: cats.map(([category], index) => {
          const perClinic = this.data.clinicProfiles.map(({profile}) => getClinicPct(profile, category));
          const avgPct = parseFloat((perClinic.reduce((s, v) => s + v, 0) / Math.max(1, perClinic.length)).toFixed(1));
          return {
            name: this.shorten(category, 18),
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
      grid: {left: 56, right: 20, top: 20, bottom: 40},
      xAxis: {
        type: 'category',
        data: [
          ...this.data.clinicProfiles.map(item => this.shorten(item.clinicId, 18)),
          'Average'
        ],
        axisLabel: {interval: 0, rotate: 18}
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {formatter: (value: number) => `${value}%`}
      },
      series: [{
        type: 'bar',
        data: [
          ...this.data.clinicProfiles.map(item => Number((this.getMissingRate(item.profile) * 100).toFixed(1))),
          Number((this.averageMissingRate() * 100).toFixed(1))
        ],
        itemStyle: {color: '#64748b', borderRadius: [8, 8, 0, 0]}
      }]
    };
  }

  private buildDeviationChartOption(): EChartsOption {
    const rows = this.deviationRows().slice(0, 8);
    const isNumeric = this.isNumeric(this.type());

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {type: 'shadow'},
        confine: true,
        formatter: (params: any) => {
          const item = params?.[0];
          if (!item) {
            return '';
          }
          return `${item.name}<br/>${this.deviationLabel()}: ${this.formatDelta(item.value, isNumeric)}`;
        }
      },
      grid: {left: 76, right: 20, top: 20, bottom: 28},
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => this.formatDeltaShort(value, isNumeric)
        }
      },
      yAxis: {
        type: 'category',
        data: rows.map(row => this.shorten(row.clinicId, 20))
      },
      series: [{
        type: 'bar',
        data: rows.map(row => ({
          value: Number((isNumeric ? row.deltaToAverage : row.deltaToAverage * 100).toFixed(2)),
          itemStyle: {
            color: row.deltaToAverage >= 0 ? '#ea580c' : '#2563eb',
            borderRadius: [0, 8, 8, 0]
          }
        }))
      }]
    };
  }

  private buildAverageBoxData(): number[] | null {
    const profiles = this.data.clinicProfiles
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
    this.data.clinicProfiles.forEach(({profile}) => {
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

  isNumeric(type: string): boolean {
    const upper = (type ?? '').toUpperCase();
    return upper === 'INTEGER' || upper === 'NUMBER';
  }

  private formatDelta(value: number, isNumeric: boolean): string {
    if (isNumeric) {
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  private formatDeltaShort(value: number, isNumeric: boolean): string {
    if (isNumeric) {
      return `${value >= 0 ? '+' : ''}${value.toFixed(1)}`;
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`;
  }

  private shorten(value: string, limit = 18): string {
    if (value.length <= limit) {
      return value;
    }
    return `${value.slice(0, limit - 1)}…`;
  }
}

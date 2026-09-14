import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import * as echarts from "echarts/core";
import {BarChart, BoxplotChart} from "echarts/charts";
import {GridComponent, LegendComponent, TooltipComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import {EChartsOption} from "echarts";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {StatisticsCategoryEntry, StatisticsColumnProfile} from "@local-app/cohort/dto/data-statistics";

echarts.use([BarChart, BoxplotChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const CATEGORY_COLORS = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed', '#0369a1', '#94a3b8'];

@Component({
  selector: 'app-cohort-statistics-property-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    NgxEchartsDirective,
    BadgeComponent
  ],
  templateUrl: './cohort-statistics-property-card.component.html',
  styleUrl: './cohort-statistics-property-card.component.scss',
  providers: [provideEchartsCore({echarts})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CohortStatisticsPropertyCardComponent {
  profile = input.required<StatisticsColumnProfile>();
  density = input<'compact' | 'comfortable'>('compact');

  readonly typeLabel = computed(() => this.formatType(this.profile().type));

  readonly missingRate = computed(() => {
    const count = this.profile().count || 0;
    if (!count) {
      return 0;
    }
    return this.profile().missing / count;
  });
  readonly topCategories = computed(() => this.normalizeTopCategories(this.profile().topCategories).slice(0, 6));
  readonly aggregatedTopCategories = computed<Array<[string, number]>>(() => {
    const profile = this.profile();
    const counts = this.normalizeTopCategories(profile.topCategories);
    const totalNonMissing = Math.max(0, (profile.count ?? 0) - (profile.missing ?? 0));

    const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topSum = top.reduce((sum, [, value]) => sum + value, 0);
    const others = totalNonMissing - topSum;

    if (others > 0) {
      top.push(['Others', others]);
    }

    return top;
  });
  readonly chartOption = computed<EChartsOption>(() => this.buildChartOption());
  readonly statItems = computed(() => [
    {label: 'Count', value: this.fmtInt(this.profile().count)},
    {label: 'Missing', value: this.fmtInt(this.profile().missing)},
    {label: 'Missing rate', value: this.fmtPct(this.missingRate())},
    {label: 'Unique', value: this.profile().uniqueValues != null ? this.fmtInt(this.profile().uniqueValues) : '—'},
    {label: 'Mean', value: this.fmtNum(this.profile().mean)},
    {label: 'Std', value: this.fmtNum(this.profile().std)},
    {label: 'Min', value: this.fmtNum(this.profile().min)},
    {label: 'P25', value: this.fmtNum(this.profile().p25)},
    {label: 'Median', value: this.fmtNum(this.profile().median)},
    {label: 'P75', value: this.fmtNum(this.profile().p75)},
    {label: 'Max', value: this.fmtNum(this.profile().max)},
  ].filter(item => item.value !== '—'));
  readonly visibleStatItems = computed(() =>
    this.density() === 'compact' ? this.statItems().slice(0, 6) : this.statItems()
  );
  readonly visibleTopCategories = computed(() =>
    this.density() === 'compact' ? this.topCategories().slice(0, 3) : this.topCategories()
  );

  typeColor(type: string): 'BLUE' | 'GREEN' | 'ORANGE' | 'GRAY' {
    const upper = type.toUpperCase();
    if (this.isNumeric(upper)) {
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

  private buildChartOption(): EChartsOption {
    if (this.topCategories().length) {
      const cats = this.aggregatedTopCategories();
      const total = cats.reduce((sum, [, value]) => sum + value, 0);
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

    if (this.isNumeric(this.profile().type)) {
      const boxValues = [
        this.profile().min,
        this.profile().p25,
        this.profile().median,
        this.profile().p75,
        this.profile().max,
      ];

      if (boxValues.every(value => value !== undefined && value !== null)) {
        return {
          tooltip: {
            trigger: 'item',
            formatter: () => {
              const profile = this.profile();
              return [
                `<strong>${profile.name}</strong>`,
                `Min: ${this.fmtNum(profile.min)}`,
                `Q1: ${this.fmtNum(profile.p25)}`,
                `Median: ${this.fmtNum(profile.median)}`,
                `Q3: ${this.fmtNum(profile.p75)}`,
                `Max: ${this.fmtNum(profile.max)}`
              ].join('<br/>');
            }
          },
          grid: {left: 50, right: 20, top: 12, bottom: 32},
          xAxis: {
            type: 'category',
            data: [this.shorten(this.profile().name, 14)],
            boundaryGap: true
          },
          yAxis: {
            type: 'value',
            scale: true
          },
          series: [{
            type: 'boxplot',
            data: [[
              this.profile().min!,
              this.profile().p25!,
              this.profile().median!,
              this.profile().p75!,
              this.profile().max!
            ]],
            itemStyle: {
              color: '#bfdbfe',
              borderColor: '#1d4ed8',
              borderWidth: 1.5
            }
          }]
        };
      }

      return {
        tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
        grid: {left: 40, right: 16, top: 12, bottom: 24},
        xAxis: {type: 'category', data: ['Mean', 'Std']},
        yAxis: {type: 'value', scale: true},
        series: [{
          type: 'bar',
          data: [
            this.profile().mean ?? 0,
            this.profile().std ?? 0
          ],
          itemStyle: {color: '#0f766e', borderRadius: [6, 6, 0, 0]}
        }]
      };
    }

    return {
      tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
      grid: {left: 40, right: 16, top: 12, bottom: 24},
      xAxis: {type: 'category', data: ['Count', 'Missing', 'Unique']},
      yAxis: {type: 'value'},
      series: [{
        type: 'bar',
        data: [
          this.profile().count ?? 0,
          this.profile().missing ?? 0,
          this.profile().uniqueValues ?? 0
        ],
        itemStyle: {
          color: (params: {dataIndex: number}) => ['#2563eb', '#ef4444', '#6b7280'][params.dataIndex] ?? '#2563eb',
          borderRadius: [6, 6, 0, 0]
        }
      }]
    };
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

  private shorten(value: string, limit = 18): string {
    if (value.length <= limit) {
      return value;
    }
    return `${value.slice(0, limit - 1)}…`;
  }

  private formatType(type: string): string {
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

  private isNumeric(type: string): boolean {
    const upper = (type ?? '').toUpperCase();
    return upper === 'INTEGER' || upper === 'NUMBER';
  }

  private fmtInt(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return '—';
    }
    return new Intl.NumberFormat(undefined, {maximumFractionDigits: 0}).format(value);
  }

  private fmtNum(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return '—';
    }
    return new Intl.NumberFormat(undefined, {maximumFractionDigits: 3}).format(value);
  }

  private fmtPct(value: number): string {
    return `${(Math.max(0, value) * 100).toFixed(value >= 0.1 ? 0 : 1)}%`;
  }
}

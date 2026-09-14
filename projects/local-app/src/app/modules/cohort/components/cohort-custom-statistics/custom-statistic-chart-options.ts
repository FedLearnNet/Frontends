import {EChartsOption} from "echarts";
import {
  BarChartConfig,
  BarChartData,
  BoxplotConfig,
  BoxplotData,
  CustomStatisticDto,
  CustomStatisticType,
  HeatmapConfig,
  HeatmapData,
  HistogramConfig,
  HistogramData,
  LineChartConfig,
  LineChartData,
  PieChartConfig,
  PieChartData,
  ScatterChartConfig,
  ScatterChartData,
} from "@local-app/cohort/dto/custom-statistics";

const PALETTE = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed', '#0369a1', '#dc2626', '#16a34a', '#ca8a04'];

export function buildCustomStatisticOption(stat: CustomStatisticDto): EChartsOption {
  switch (stat.type) {
    case CustomStatisticType.BAR:
      return buildBarOption(stat.config as BarChartConfig, stat.data as BarChartData | null | undefined);
    case CustomStatisticType.PIE:
      return buildPieOption(stat.config as PieChartConfig, stat.data as PieChartData | null | undefined);
    case CustomStatisticType.LINE:
      return buildLineOption(stat.config as LineChartConfig, stat.data as LineChartData | null | undefined);
    case CustomStatisticType.SCATTER:
      return buildScatterOption(stat.config as ScatterChartConfig, stat.data as ScatterChartData | null | undefined);
    case CustomStatisticType.HISTOGRAM:
      return buildHistogramOption(stat.config as HistogramConfig, stat.data as HistogramData | null | undefined);
    case CustomStatisticType.BOXPLOT:
      return buildBoxplotOption(stat.config as BoxplotConfig, stat.data as BoxplotData | null | undefined);
    case CustomStatisticType.HEATMAP:
      return buildHeatmapOption(stat.config as HeatmapConfig, stat.data as HeatmapData | null | undefined);
  }
}

function buildBarOption(config: BarChartConfig, data: BarChartData | null | undefined): EChartsOption {
  const categories = data?.categories ?? [];
  const series = (data?.series ?? []).map((s, i) => ({
    name: s.name,
    type: 'bar' as const,
    stack: config.stacked ? 'stack' : undefined,
    data: s.values,
    itemStyle: {color: PALETTE[i % PALETTE.length], borderRadius: [6, 6, 0, 0]},
  }));
  const horizontal = config.orientation === 'HORIZONTAL';
  return {
    tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
    legend: series.length > 1 ? {bottom: 0} : undefined,
    grid: {left: 48, right: 16, top: 16, bottom: series.length > 1 ? 40 : 28},
    xAxis: horizontal
      ? {type: 'value'}
      : {type: 'category', data: categories, axisLabel: {interval: 0, rotate: 24}},
    yAxis: horizontal
      ? {type: 'category', data: categories}
      : {type: 'value'},
    series,
  };
}

function buildPieOption(config: PieChartConfig, data: PieChartData | null | undefined): EChartsOption {
  return {
    tooltip: {trigger: 'item'},
    legend: {bottom: 0, type: 'scroll'},
    series: [{
      type: 'pie',
      radius: config.donut ? ['45%', '70%'] : '70%',
      center: ['50%', '45%'],
      data: (data?.slices ?? []).map((slice, i) => ({
        name: slice.name,
        value: slice.value,
        itemStyle: {color: PALETTE[i % PALETTE.length]},
      })),
      label: {show: config.showLabels, formatter: '{b}: {d}%'},
      labelLine: {show: config.showLabels},
    }],
  };
}

function buildLineOption(config: LineChartConfig, data: LineChartData | null | undefined): EChartsOption {
  const series = (data?.series ?? []).map((s, i) => ({
    name: s.name,
    type: 'line' as const,
    smooth: config.smooth,
    areaStyle: config.area ? {opacity: 0.18} : undefined,
    data: s.values,
    itemStyle: {color: PALETTE[i % PALETTE.length]},
    lineStyle: {color: PALETTE[i % PALETTE.length]},
  }));
  return {
    tooltip: {trigger: 'axis'},
    legend: series.length > 1 ? {bottom: 0} : undefined,
    grid: {left: 48, right: 16, top: 16, bottom: series.length > 1 ? 40 : 28},
    xAxis: {type: 'category', data: (data?.xValues ?? []).map(String), boundaryGap: false},
    yAxis: {type: 'value'},
    series,
  };
}

function buildScatterOption(config: ScatterChartConfig, data: ScatterChartData | null | undefined): EChartsOption {
  const groups = data?.groups ?? [];
  const series = groups.map((group, i) => ({
    name: group.name,
    type: 'scatter' as const,
    data: group.points,
    symbolSize: config.sizeProperty
      ? (value: number[]) => Math.max(6, Math.min(40, (value[2] ?? 8)))
      : 10,
    itemStyle: {color: PALETTE[i % PALETTE.length], opacity: 0.78},
  }));
  return {
    tooltip: {trigger: 'item'},
    legend: groups.length > 1 ? {bottom: 0} : undefined,
    grid: {left: 48, right: 16, top: 16, bottom: groups.length > 1 ? 40 : 28},
    xAxis: {type: 'value', name: config.xProperty, scale: true},
    yAxis: {type: 'value', name: config.yProperty, scale: true},
    series,
  };
}

function buildHistogramOption(config: HistogramConfig, data: HistogramData | null | undefined): EChartsOption {
  const bins = data?.bins ?? [];
  const categories = bins.map(bin => `${formatNumber(bin.start)}–${formatNumber(bin.end)}`);
  let values = bins.map(bin => bin.count);
  if (config.cumulative) {
    let acc = 0;
    values = values.map(v => (acc += v));
  }
  if (config.density) {
    const total = values.reduce((s, v) => s + v, 0) || 1;
    values = values.map(v => parseFloat((v / total).toFixed(4)));
  }
  return {
    tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
    grid: {left: 56, right: 16, top: 16, bottom: 32},
    xAxis: {type: 'category', data: categories, axisLabel: {interval: 0, rotate: 24}},
    yAxis: {type: 'value', name: config.density ? 'density' : 'count'},
    series: [{
      type: 'bar',
      data: values,
      barCategoryGap: '2%',
      itemStyle: {color: '#1d4ed8', borderRadius: [4, 4, 0, 0]},
    }],
  };
}

function buildBoxplotOption(config: BoxplotConfig, data: BoxplotData | null | undefined): EChartsOption {
  const groups = data?.groups ?? [];
  const boxData = groups.map(g => [g.min, g.p25, g.median, g.p75, g.max]);
  const outliers: [number, number][] = [];
  groups.forEach((group, idx) => {
    if (config.showOutliers) {
      (group.outliers ?? []).forEach(value => outliers.push([idx, value]));
    }
  });
  return {
    tooltip: {trigger: 'item'},
    grid: {left: 56, right: 16, top: 16, bottom: 32},
    xAxis: {
      type: 'category',
      data: groups.map(g => g.label),
      axisLabel: {interval: 0, rotate: 24},
    },
    yAxis: {type: 'value', name: config.property, scale: true},
    series: [
      {
        type: 'boxplot',
        data: boxData,
        itemStyle: {color: '#bfdbfe', borderColor: '#1d4ed8', borderWidth: 1.5},
      },
      ...(config.showOutliers && outliers.length ? [{
        name: 'outliers',
        type: 'scatter' as const,
        data: outliers,
        symbolSize: 6,
        itemStyle: {color: '#ea580c'},
      }] : []),
    ],
  };
}

function buildHeatmapOption(config: HeatmapConfig, data: HeatmapData | null | undefined): EChartsOption {
  const cells = data?.cells ?? [];
  const max = cells.reduce((acc, [, , v]) => Math.max(acc, v), 0);
  return {
    tooltip: {position: 'top'},
    grid: {left: 80, right: 16, top: 16, bottom: 60},
    xAxis: {
      type: 'category',
      data: data?.xLabels ?? [],
      splitArea: {show: true},
      axisLabel: {interval: 0, rotate: 24},
    },
    yAxis: {
      type: 'category',
      data: data?.yLabels ?? [],
      splitArea: {show: true},
    },
    visualMap: {
      min: 0,
      max: max || 1,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: {color: ['#eff6ff', '#1d4ed8']},
    },
    series: [{
      name: config.valueProperty ?? config.aggregation,
      type: 'heatmap',
      data: cells,
      label: {show: false},
      emphasis: {itemStyle: {shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.2)'}},
    }],
  };
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return value.toString();
  return value.toFixed(2);
}

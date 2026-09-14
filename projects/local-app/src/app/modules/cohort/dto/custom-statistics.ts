import {BaseDto} from "@shared-lib/base/base-dto";

export enum CustomStatisticType {
  BAR = 'BAR',
  PIE = 'PIE',
  LINE = 'LINE',
  SCATTER = 'SCATTER',
  HISTOGRAM = 'HISTOGRAM',
  BOXPLOT = 'BOXPLOT',
  HEATMAP = 'HEATMAP',
}

export enum CustomStatisticAggregation {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  MEDIAN = 'MEDIAN',
}

export enum CustomStatisticTimeGranularity {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export interface CustomStatisticConfigBase {
  type: CustomStatisticType;
}

export interface BarChartConfig extends CustomStatisticConfigBase {
  type: CustomStatisticType.BAR;
  xProperty: string;
  yProperty?: string | null;
  aggregation: CustomStatisticAggregation;
  groupByProperty?: string | null;
  orientation: 'VERTICAL' | 'HORIZONTAL';
  limit?: number | null;
  sortBy: 'VALUE_DESC' | 'VALUE_ASC' | 'LABEL';
  stacked?: boolean;
}

export interface PieChartConfig extends CustomStatisticConfigBase {
  type: CustomStatisticType.PIE;
  property: string;
  valueProperty?: string | null;
  aggregation: CustomStatisticAggregation;
  topN?: number | null;
  donut: boolean;
  showLabels: boolean;
}

export interface LineChartConfig extends CustomStatisticConfigBase {
  type: CustomStatisticType.LINE;
  xProperty: string;
  yProperty: string;
  aggregation: CustomStatisticAggregation;
  granularity?: CustomStatisticTimeGranularity | null;
  groupByProperty?: string | null;
  smooth: boolean;
  area: boolean;
}

export interface ScatterChartConfig extends CustomStatisticConfigBase {
  type: CustomStatisticType.SCATTER;
  xProperty: string;
  yProperty: string;
  groupByProperty?: string | null;
  sizeProperty?: string | null;
  trendline: boolean;
}

export interface HistogramConfig extends CustomStatisticConfigBase {
  type: CustomStatisticType.HISTOGRAM;
  property: string;
  bins: number;
  min?: number | null;
  max?: number | null;
  cumulative: boolean;
  density: boolean;
}

export interface BoxplotConfig extends CustomStatisticConfigBase {
  type: CustomStatisticType.BOXPLOT;
  property: string;
  groupByProperty?: string | null;
  showOutliers: boolean;
}

export interface HeatmapConfig extends CustomStatisticConfigBase {
  type: CustomStatisticType.HEATMAP;
  xProperty: string;
  yProperty: string;
  valueProperty?: string | null;
  aggregation: CustomStatisticAggregation;
  xBins?: number | null;
  yBins?: number | null;
}

export type CustomStatisticConfig =
  | BarChartConfig
  | PieChartConfig
  | LineChartConfig
  | ScatterChartConfig
  | HistogramConfig
  | BoxplotConfig
  | HeatmapConfig;

export type CustomStatisticData =
  | BarChartData
  | PieChartData
  | LineChartData
  | ScatterChartData
  | HistogramData
  | BoxplotData
  | HeatmapData;

export interface BarChartData {
  categories: string[];
  series: { name: string; values: number[] }[];
}

export interface PieChartData {
  slices: { name: string; value: number }[];
}

export interface LineChartData {
  xValues: (string | number)[];
  series: { name: string; values: number[] }[];
}

export interface ScatterChartData {
  groups: { name: string; points: [number, number, number?][] }[];
}

export interface HistogramData {
  bins: { start: number; end: number; count: number }[];
}

export interface BoxplotData {
  groups: {
    label: string;
    min: number;
    p25: number;
    median: number;
    p75: number;
    max: number;
    outliers?: number[];
  }[];
}

export interface HeatmapData {
  xLabels: string[];
  yLabels: string[];
  cells: [number, number, number][];
}

export interface CustomStatisticDto extends BaseDto {
  dashboardId: number;
  name: string;
  type: CustomStatisticType;
  config: CustomStatisticConfig;
  data?: CustomStatisticData | null;
  sortOrder?: number;
}

export interface CreateCustomStatisticDto {
  dashboardId: number;
  name: string;
  type: CustomStatisticType;
  config: CustomStatisticConfig;
}

export interface CustomStatisticsDashboardDto extends BaseDto {
  cohortId: number;
  name: string;
  sortOrder?: number;
}

export interface CreateCustomStatisticsDashboardDto {
  cohortId: number;
  name: string;
}

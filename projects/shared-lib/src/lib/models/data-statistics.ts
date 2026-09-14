import {EChartsOption} from "echarts";

export interface CsvFileSchemaField {
  name: string;
  type: 'Utf8' | 'Int32' | 'Float64' | 'Bool' | 'Mixed';
}

export type DiagramType =
  | 'histogram'
  | 'boxplot'
  | 'categoryCount'
  | 'scatter'
  | 'boxplotByCategory'
  | 'meanByCategory'
  | 'correlationMatrix'
  | 'parallelCoordinates';

export interface CsvFileStatisticsField extends CsvFileSchemaField {
  count?: number;
  missing?: number;
  mean?: number;
  median?: number;
  min?: number;
  q1?: number;
  q3?: number;
  max?: number;
  std?: number;
  iqr?: number;
  previewHistogram?: {
    bins: number[];
    min: number;
    step: number;
  };
  topCategories?: Array<{
    value: string;
    count: number;
  }>;
  distinctCount?: number;
}


export interface ChartSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'univariate' | 'bivariate' | 'multivariate' | 'derived';
  requiredColumns: string[];
  optionFactory: () => EChartsOption;
  score: number; // for ranking suggestions
}

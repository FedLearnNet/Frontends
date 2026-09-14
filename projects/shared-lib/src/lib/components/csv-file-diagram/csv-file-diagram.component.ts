import {ChangeDetectionStrategy, Component, computed, effect, inject, input, signal} from '@angular/core';
import {ChartSuggestion, CsvFileStatisticsField, DiagramType} from "@shared-lib/models/data-statistics";
import {DataStatistics} from "@shared-lib/services/data-statistics";
import {EChartsOption} from "echarts";
import * as echarts from "echarts/core";
import {BarChart, BoxplotChart, HeatmapChart, LineChart, ScatterChart} from "echarts/charts";
import {GridComponent, TooltipComponent, VisualMapComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";

import {NgxEchartsDirective, provideEchartsCore} from "ngx-echarts";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";

echarts.use([
  BarChart,
  BoxplotChart,
  ScatterChart,
  HeatmapChart,
  VisualMapComponent,
  LineChart,
  GridComponent,
  CanvasRenderer,
  TooltipComponent
])

interface DiagramTypeConfig {
  id: DiagramType;
  label: string;
  minNumeric: number;
  maxNumeric: number | 'any';
  minCategorical: number;
  maxCategorical: number | 'any';
  builder: (rows: any[],
            numericCols: string[],
            categoricalCols: string[]) => EChartsOption;
}

@Component({
  selector: 'lib-csv-file-diagram',
  imports: [
    NgxEchartsDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatButton,
    FormsModule
],
  templateUrl: './csv-file-diagram.component.html',
  styleUrl: './csv-file-diagram.component.scss',
  providers: [provideEchartsCore({echarts})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CsvFileDiagramComponent {
  private readonly dataStatistics: DataStatistics = inject(DataStatistics);

  statistics = input.required<Map<string, CsvFileStatisticsField>>();
  rows = input.required<Array<Record<string, any>>>();

  selectedNumeric = signal<string[]>([]);
  selectedCategorical = signal<string[]>([]);
  validationMessage = signal<string | null>(null);
  diagramType = signal<DiagramType | null>(null);
  currentOption = signal<EChartsOption | null>(null);


  numericColumns = computed(() =>
    Array.from(this.statistics().values())
      .filter(p => p.type === 'Float64' || p.type === 'Int32')
      .map(p => p.name)
  );

  categoricalColumns = computed(() =>
    Array.from(this.statistics().values())
      .filter(p => p.type === 'Utf8' || p.type === 'Bool')
      .map(p => p.name)
  );

  constructor() {
    effect(() => {
      // Trigger rebuild when any selection changes
      this.diagramType();
      this.selectedNumeric();
      this.selectedCategorical();
      this.buildChartOption();
    });
  }

  availableDiagramTypes = computed(() => {
    const nNum = this.numericColumns().length;
    const nCat = this.categoricalColumns().length;
    return this.diagramTypeConfigs.filter(cfg => {
      const okNum =
        nNum >= cfg.minNumeric &&
        (cfg.maxNumeric === 'any' || cfg.maxNumeric <= nNum);
      const okCat =
        nCat >= cfg.minCategorical &&
        (cfg.maxCategorical === 'any' || cfg.maxCategorical <= nCat);
      return okNum && okCat;
    });
  });

  private diagramTypeConfigs: DiagramTypeConfig[] = [
    {
      id: 'histogram',
      label: 'Histogram',
      minNumeric: 1, maxNumeric: 1,
      minCategorical: 0, maxCategorical: 0,
      builder: (rows, nums) =>
        this.dataStatistics.buildHistogramOption(rows, nums[0])
    },
    {
      id: 'boxplot',
      label: 'Boxplot',
      minNumeric: 1, maxNumeric: 1,
      minCategorical: 0, maxCategorical: 0,
      builder: (rows, nums) =>
        this.dataStatistics.buildBoxplotOption(rows, nums[0])
    },
    {
      id: 'categoryCount',
      label: 'Category Count',
      minNumeric: 0, maxNumeric: 0,
      minCategorical: 1, maxCategorical: 1,
      builder: (rows, _n, cats) =>
        this.dataStatistics.buildCategoryCountOption(rows, cats[0])
    },
    {
      id: 'scatter',
      label: 'Scatter (X vs Y)',
      minNumeric: 2, maxNumeric: 2,
      minCategorical: 0, maxCategorical: 0,
      builder: (rows, nums) =>
        this.dataStatistics.buildScatterOption(rows, nums[0], nums[1])
    },
    {
      id: 'boxplotByCategory',
      label: 'Boxplot by Category',
      minNumeric: 1, maxNumeric: 1,
      minCategorical: 1, maxCategorical: 1,
      builder: (rows, nums, cats) =>
        this.dataStatistics.buildGroupedBoxplotOption(rows, nums[0], cats[0])
    },
    {
      id: 'meanByCategory',
      label: 'Mean by Category',
      minNumeric: 1, maxNumeric: 1,
      minCategorical: 1, maxCategorical: 1,
      builder: (rows, nums, cats) =>
        this.dataStatistics.buildMeanBarOption(rows, nums[0], cats[0])
    },
    {
      id: 'correlationMatrix',
      label: 'Correlation Matrix',
      minNumeric: 3, maxNumeric: 'any',
      minCategorical: 0, maxCategorical: 0,
      builder: (rows, nums) =>
        this.dataStatistics.buildCorrelationHeatmapOption(rows, nums)
    },
    {
      id: 'parallelCoordinates',
      label: 'Parallel Coordinates',
      minNumeric: 3, maxNumeric: 'any',
      minCategorical: 0, maxCategorical: 0,
      builder: (rows, nums) =>
        this.dataStatistics.buildParallelCoordinatesOption(rows, nums)
    }
  ];


  selectSuggestion(s: ChartSuggestion) {
    const config = s.optionFactory();
    this.currentOption.set(config);
  }

  reset() {
    this.currentOption.set(null);
  }

  resetAll() {
    this.diagramType.set(null);
    this.selectedNumeric.set([]);
    this.selectedCategorical.set([]);
    this.currentOption.set(null);
    this.validationMessage.set(null);
  }

  setDiagramType(t: DiagramType | null) {
    this.diagramType.set(t);
    this.selectedNumeric.set([]);
    this.selectedCategorical.set([]);
  }

  isNumericDisabled(col: string): boolean {
    const cfg = this.getCurrentConfig();
    if (!cfg) return true;
    const curr = this.selectedNumeric();
    if (curr.includes(col)) return false;
    if (cfg.maxNumeric === 'any') return false;
    return curr.length >= cfg.maxNumeric;
  }

  isCategoricalDisabled(col: string): boolean {
    const cfg = this.getCurrentConfig();
    if (!cfg) return true;
    const curr = this.selectedCategorical();
    if (curr.includes(col)) return false;
    if (cfg.maxCategorical === 'any') return false;
    return curr.length >= cfg.maxCategorical;
  }


  private buildChartOption() {
    const cfg = this.getCurrentConfig();
    if (!cfg) {
      this.currentOption.set(null);
      return;
    }

    const nums = this.selectedNumeric();
    const cats = this.selectedCategorical();

    if (nums.length < cfg.minNumeric ||
      (cfg.maxNumeric !== 'any' && nums.length > cfg.maxNumeric)) {
      this.validationMessage
        .set(`Select ${cfg.minNumeric === cfg.maxNumeric
          ? cfg.minNumeric
          : `${cfg.minNumeric}+`} numeric variable(s).`);
      this.currentOption.set(null);
      return;
    }

    if (cats.length < cfg.minCategorical ||
      (cfg.maxCategorical !== 'any' && cats.length > cfg.maxCategorical)) {
      this.validationMessage
        .set(`Select ${cfg.minCategorical === cfg.maxCategorical
          ? cfg.minCategorical
          : `${cfg.minCategorical}+`} categorical variable(s).`);
      this.currentOption.set(null);
      return;
    }

    this.validationMessage.set(null);
    const option = cfg.builder(this.rows(), nums, cats);
    this.currentOption.set(option);
  }

  private getCurrentConfig(): DiagramTypeConfig | undefined {
    const dt = this.diagramType();
    return this.diagramTypeConfigs.find(c => c.id === dt!);
  }
}

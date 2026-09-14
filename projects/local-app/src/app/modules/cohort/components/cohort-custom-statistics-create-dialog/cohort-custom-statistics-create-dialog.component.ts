import {Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {SelectBtnComponent} from '@shared-lib/components/select-btn/select-btn.component';
import {CustomStatisticsService} from "@local-app/cohort/services/custom-statistics.service";
import {StatisticsColumnProfile} from "@local-app/cohort/dto/data-statistics";
import {
  BarChartConfig,
  BoxplotConfig,
  CreateCustomStatisticDto,
  CustomStatisticAggregation,
  CustomStatisticConfig,
  CustomStatisticDto,
  CustomStatisticTimeGranularity,
  CustomStatisticType,
  HeatmapConfig,
  HistogramConfig,
  LineChartConfig,
  PieChartConfig,
  ScatterChartConfig,
} from "@local-app/cohort/dto/custom-statistics";

export interface CohortCustomStatisticsCreateDialogData {
  dashboardId: number;
  properties: StatisticsColumnProfile[];
}

export type CohortCustomStatisticsCreateDialogResult = CustomStatisticDto | undefined;

interface TypeOption {
  value: CustomStatisticType;
  label: string;
  description: string;
  icon: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {value: CustomStatisticType.BAR, label: 'Bar', description: 'Categorical counts or aggregations', icon: 'bar_chart'},
  {value: CustomStatisticType.PIE, label: 'Pie', description: 'Share of total per category', icon: 'pie_chart'},
  {value: CustomStatisticType.LINE, label: 'Line', description: 'Trend over time or ordered axis', icon: 'show_chart'},
  {value: CustomStatisticType.SCATTER, label: 'Scatter', description: 'Two numeric properties, optionally grouped', icon: 'scatter_plot'},
  {value: CustomStatisticType.HISTOGRAM, label: 'Histogram', description: 'Distribution of a numeric property', icon: 'equalizer'},
  {value: CustomStatisticType.BOXPLOT, label: 'Box plot', description: 'Quartiles, optionally by group', icon: 'candlestick_chart'},
  {value: CustomStatisticType.HEATMAP, label: 'Heatmap', description: 'Density across two axes', icon: 'grid_on'},
];

const NUMERIC_TYPES = new Set(['INTEGER', 'NUMBER']);
const TEMPORAL_TYPES = new Set(['DATETIME', 'DATE']);

@Component({
  selector: 'app-cohort-custom-statistics-create-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatButtonToggleModule,
    CloseableDialogTitleComponent,
    BtnComponent,
    SelectBtnComponent,
  ],
  templateUrl: './cohort-custom-statistics-create-dialog.component.html',
  styleUrl: './cohort-custom-statistics-create-dialog.component.scss',
})
export class CohortCustomStatisticsCreateDialogComponent {
  private readonly dialogRef: MatDialogRef<
    CohortCustomStatisticsCreateDialogComponent,
    CohortCustomStatisticsCreateDialogResult
  > = inject(MatDialogRef);
  private readonly customStatisticsService: CustomStatisticsService = inject(CustomStatisticsService);

  readonly data = inject<CohortCustomStatisticsCreateDialogData>(MAT_DIALOG_DATA);

  readonly typeOptions = TYPE_OPTIONS;
  readonly aggregations = Object.values(CustomStatisticAggregation);
  readonly granularities = Object.values(CustomStatisticTimeGranularity);
  readonly CustomStatisticType = CustomStatisticType;

  readonly step = signal<1 | 2>(1);
  readonly saving = signal<boolean>(false);

  readonly name = signal<string>('');
  readonly selectedType = signal<CustomStatisticType>(CustomStatisticType.BAR);

  readonly barConfig = signal<BarChartConfig>({
    type: CustomStatisticType.BAR,
    xProperty: '',
    yProperty: null,
    aggregation: CustomStatisticAggregation.COUNT,
    groupByProperty: null,
    orientation: 'VERTICAL',
    limit: 10,
    sortBy: 'VALUE_DESC',
    stacked: false,
  });

  readonly pieConfig = signal<PieChartConfig>({
    type: CustomStatisticType.PIE,
    property: '',
    valueProperty: null,
    aggregation: CustomStatisticAggregation.COUNT,
    topN: 6,
    donut: true,
    showLabels: true,
  });

  readonly lineConfig = signal<LineChartConfig>({
    type: CustomStatisticType.LINE,
    xProperty: '',
    yProperty: '',
    aggregation: CustomStatisticAggregation.AVG,
    granularity: CustomStatisticTimeGranularity.MONTH,
    groupByProperty: null,
    smooth: true,
    area: false,
  });

  readonly scatterConfig = signal<ScatterChartConfig>({
    type: CustomStatisticType.SCATTER,
    xProperty: '',
    yProperty: '',
    groupByProperty: null,
    sizeProperty: null,
    trendline: false,
  });

  readonly histogramConfig = signal<HistogramConfig>({
    type: CustomStatisticType.HISTOGRAM,
    property: '',
    bins: 20,
    min: null,
    max: null,
    cumulative: false,
    density: false,
  });

  readonly boxplotConfig = signal<BoxplotConfig>({
    type: CustomStatisticType.BOXPLOT,
    property: '',
    groupByProperty: null,
    showOutliers: true,
  });

  readonly heatmapConfig = signal<HeatmapConfig>({
    type: CustomStatisticType.HEATMAP,
    xProperty: '',
    yProperty: '',
    valueProperty: null,
    aggregation: CustomStatisticAggregation.COUNT,
    xBins: 10,
    yBins: 10,
  });

  readonly allProperties = computed(() => this.data.properties ?? []);
  readonly numericProperties = computed(() =>
    this.allProperties().filter(p => NUMERIC_TYPES.has((p.type ?? '').toUpperCase()))
  );
  readonly categoricalProperties = computed(() =>
    this.allProperties().filter(p => !NUMERIC_TYPES.has((p.type ?? '').toUpperCase()))
  );
  readonly temporalProperties = computed(() =>
    this.allProperties().filter(p => TEMPORAL_TYPES.has((p.type ?? '').toUpperCase()))
  );

  readonly canContinue = computed(() => !!this.name().trim());

  readonly canSubmit = computed(() => {
    if (!this.name().trim()) return false;
    switch (this.selectedType()) {
      case CustomStatisticType.BAR:
        return !!this.barConfig().xProperty;
      case CustomStatisticType.PIE:
        return !!this.pieConfig().property;
      case CustomStatisticType.LINE:
        return !!this.lineConfig().xProperty && !!this.lineConfig().yProperty;
      case CustomStatisticType.SCATTER:
        return !!this.scatterConfig().xProperty && !!this.scatterConfig().yProperty;
      case CustomStatisticType.HISTOGRAM:
        return !!this.histogramConfig().property && this.histogramConfig().bins > 0;
      case CustomStatisticType.BOXPLOT:
        return !!this.boxplotConfig().property;
      case CustomStatisticType.HEATMAP:
        return !!this.heatmapConfig().xProperty && !!this.heatmapConfig().yProperty;
    }
  });

  selectType(type: CustomStatisticType): void {
    this.selectedType.set(type);
  }

  next(): void {
    if (this.canContinue()) this.step.set(2);
  }

  back(): void {
    this.step.set(1);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  patchBar<K extends keyof BarChartConfig>(key: K, value: BarChartConfig[K]): void {
    this.barConfig.update(c => ({...c, [key]: value}));
  }

  patchPie<K extends keyof PieChartConfig>(key: K, value: PieChartConfig[K]): void {
    this.pieConfig.update(c => ({...c, [key]: value}));
  }

  patchLine<K extends keyof LineChartConfig>(key: K, value: LineChartConfig[K]): void {
    this.lineConfig.update(c => ({...c, [key]: value}));
  }

  patchScatter<K extends keyof ScatterChartConfig>(key: K, value: ScatterChartConfig[K]): void {
    this.scatterConfig.update(c => ({...c, [key]: value}));
  }

  patchHistogram<K extends keyof HistogramConfig>(key: K, value: HistogramConfig[K]): void {
    this.histogramConfig.update(c => ({...c, [key]: value}));
  }

  patchBoxplot<K extends keyof BoxplotConfig>(key: K, value: BoxplotConfig[K]): void {
    this.boxplotConfig.update(c => ({...c, [key]: value}));
  }

  patchHeatmap<K extends keyof HeatmapConfig>(key: K, value: HeatmapConfig[K]): void {
    this.heatmapConfig.update(c => ({...c, [key]: value}));
  }

  submit(): void {
    if (!this.canSubmit()) return;
    const config = this.currentConfig();
    const dto: CreateCustomStatisticDto = {
      dashboardId: this.data.dashboardId,
      name: this.name().trim(),
      type: this.selectedType(),
      config,
    };
    this.saving.set(true);
    this.customStatisticsService.create(dto).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.dialogRef.close(created);
      },
      error: () => this.saving.set(false),
    });
  }

  private currentConfig(): CustomStatisticConfig {
    switch (this.selectedType()) {
      case CustomStatisticType.BAR: return this.barConfig();
      case CustomStatisticType.PIE: return this.pieConfig();
      case CustomStatisticType.LINE: return this.lineConfig();
      case CustomStatisticType.SCATTER: return this.scatterConfig();
      case CustomStatisticType.HISTOGRAM: return this.histogramConfig();
      case CustomStatisticType.BOXPLOT: return this.boxplotConfig();
      case CustomStatisticType.HEATMAP: return this.heatmapConfig();
    }
  }
}

import {ChangeDetectionStrategy, Component, computed, effect, forwardRef, input, model, signal,} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {animate, style, transition, trigger} from '@angular/animations';
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {SelectBtnComponent} from '@shared-lib/components/select-btn/select-btn.component';

type ToolTypeMeta = {
  type: FederatedAppType;
  label: string;
  tagline: string;
  description: string;
  example: string;
  icon: string;
};

@Component({
  selector: 'lib-tool-type-selector',
  standalone: true,
  imports: [BadgeComponent, InfoCardComponent, SelectBtnComponent],
  templateUrl: './tool-type-selector.component.html',
  styleUrl: './tool-type-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToolTypeSelectorComponent),
      multi: true,
    },
  ],
  animations: [
    trigger('selectPop', [
      transition(':enter', [
        style({transform: 'scale(0.98)', opacity: 0}),
        animate('140ms ease-out', style({transform: 'scale(1)', opacity: 1})),
      ]),
    ]),
  ],
})
export class ToolTypeSelectorComponent implements ControlValueAccessor {
  value = model<FederatedAppType | null>(null);

  showRequiredError = input<boolean>(false);

  disabled = input<boolean>(false);

  compact = input<boolean>(false);

  private readonly innerValue = signal<FederatedAppType | null>(null);
  private readonly innerDisabled = signal<boolean>(false);

  readonly selectedType = computed(() => this.innerValue());
  readonly isDisabled = computed(() => this.innerDisabled() || this.disabled());

  readonly selectedMeta = computed(() => {
    const t = this.selectedType();
    return this.typeMeta.find(x => x.type === t) ?? null;
  });
  readonly typeMeta: ToolTypeMeta[] = [
    {
      type: FederatedAppType.PRE_PROCESSING,
      label: 'Pre-processing',
      tagline: 'Clean & prepare input data',
      description: 'Transforms raw inputs into a stable, standardized format before analysis.',
      example: 'Example: de-identification, missing-value imputation, normalization.',
      icon: 'filter_alt',
    },
    {
      type: FederatedAppType.ANALYSIS,
      label: 'Analysis',
      tagline: 'Run the trainable computation',
      description: 'Performs the main trainable step and produces primary results.',
      example: 'Example: model training, graph algorithms.',
      icon: 'analytics',
    },
    {
      type: FederatedAppType.POST_PROCESSING,
      label: 'Post-processing',
      tagline: 'Refine outputs & artifacts',
      description: 'Takes analysis outputs and converts them into consumable, polished results.',
      example: 'Example: thresholding, report generation, formatting, summarization.',
      icon: 'tune',
    },
    {
      type: FederatedAppType.EVALUATION,
      label: 'Evaluation',
      tagline: 'Measure performance & quality',
      description: 'Computes metrics, compares baselines, and validates outputs against references.',
      example: 'Example: AUROC, F1, calibration, drift checks, QC scoring.',
      icon: 'fact_check',
    },
    {
      type: FederatedAppType.SELF_LEARNED,
      label: 'Self-learned',
      tagline: 'Analysis which doesn\'t need training',
      description: 'A tool that performs unsupervised analysis or adapts using user feedback.',
      example: 'Example: clustering, statistics',
      icon: 'model_training',
    },
    {
      type: FederatedAppType.DATA_TRANSFORMATION,
      label: 'Data transformation',
      tagline: 'Map schemas & convert formats',
      description: 'Reshapes data: schema mapping, type conversion, joining/splitting datasets.',
      example: 'Example: CSV→Parquet, HL7→FHIR mapping, feature engineering.',
      icon: 'transform',
    },
    {
      type: FederatedAppType.EXTRACTOR,
      label: 'Database adopter',
      tagline: 'Connect to external systems',
      description: 'Bridges or syncs data from external databases/services into your platform.',
      example: 'Example: Postgres connector, S3 ingestion, UMLS import pipeline.',
      icon: 'storage',
    },
    {
      type: FederatedAppType.EXPORT,
      label: 'Export',
      tagline: 'Deliver data outside the system',
      description: 'Packages results for downstream usage: files, endpoints, dashboards.',
      example: 'Example: export CSV/JSON, push to registry, publish report bundle.',
      icon: 'ios_share',
    },
  ];
  private onChange: (v: FederatedAppType | null) => void = () => {
  };
  private onTouched: () => void = () => {
  };

  constructor() {
    effect(() => {
      const external = this.value();
      if (external !== undefined) {
        this.innerValue.set(external);
      }
    });
  }

  writeValue(v: FederatedAppType | null): void {
    this.innerValue.set(v);
  }

  registerOnChange(fn: (v: FederatedAppType | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.innerDisabled.set(isDisabled);
  }

  select(t: FederatedAppType) {
    if (this.isDisabled()) return;

    this.innerValue.set(t);
    this.onTouched();
    this.onChange(t);
    this.value.set(t);
  }

  protected readonly FederatedAppType = FederatedAppType;
}

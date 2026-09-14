import {CommonModule} from '@angular/common';
import {Component, computed, input, output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {PatientDataExportConfigDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {
  flattenExportFeatures,
  hasExportSelections
} from "@shared-lib/modules/data-modeler/utils/patient-export-config.util";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

@Component({
  selector: 'app-dataset-preview-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    BadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './dataset-preview-card.component.html',
  styleUrl: './dataset-preview-card.component.scss',
})
export class DatasetPreviewCardComponent {
  config = input<PatientDataExportConfigDTO | null | undefined>(null);
  title = input<string>('Dataset design');
  subtitle = input<string>('Review the current export dataset at a glance before editing or saving it.');
  queryName = input<string | null>(null);
  actionLabel = input<string>('Open dataset');
  emptyActionLabel = input<string>('Create new dataset');
  showAction = input<boolean>(true);

  actionClicked = output<void>();

  readonly normalizedConfig = computed(() =>
    this.config() ?? {} as PatientDataExportConfigDTO
  );
  readonly hasDataset = computed(() => hasExportSelections(this.normalizedConfig()));
  readonly features = computed(() =>
    this.normalizedConfig().features?.filter(feature => (feature.allowedDataIds?.length ?? 0) > 0) ?? []
  );
  readonly featureCount = computed(() => this.features().length);
  readonly selectionCount = computed(() => flattenExportFeatures(this.features()).length);
  readonly exportModeLabel = computed(() => this.normalizedConfig().appBased ? 'App-based export' : 'Native export');
  readonly formatLabel = computed(() => this.normalizedConfig().wideFormat ? 'Wide format' : 'Long format');
  readonly featurePreview = computed(() => this.features().slice(0, 4));
  readonly hiddenFeatureCount = computed(() => Math.max(0, this.featureCount() - this.featurePreview().length));
  readonly joinFieldLabel = computed(() =>
    this.normalizedConfig().joinFields?.length
      ? this.normalizedConfig().joinFields!.join(', ')
      : 'No additional join fields'
  );
  readonly duplicatePolicyLabel = computed(() => this.normalizedConfig().duplicatePolicy ?? 'n/a');
}

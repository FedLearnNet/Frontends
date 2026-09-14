import {CommonModule} from '@angular/common';
import {CdkDragHandle} from "@angular/cdk/drag-drop";
import {Component, computed, input, output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {DatasetSelectionOption} from "@global-app/project/components/dataset-builder-page/dataset-builder.models";
import {readDatasetSelectionTransfer} from "@global-app/project/components/dataset-builder-page/dataset-drag-drop.util";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  PatientExportFeatureDTO,
  SelectedDataIdsDTO
} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {toSelectionKey} from "@shared-lib/modules/data-modeler/utils/patient-export-config.util";

@Component({
  selector: 'app-dataset-feature-card',
  imports: [
    CommonModule,
    FormsModule,
    CdkDragHandle,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    BadgeComponent
  ],
  templateUrl: './dataset-feature-card.component.html',
  styleUrl: './dataset-feature-card.component.scss',
})
export class DatasetFeatureCardComponent {
  feature = input.required<PatientExportFeatureDTO>();
  selectionOptions = input.required<DatasetSelectionOption[]>();
  active = input<boolean>(false);
  draggedSelection = input<SelectedDataIdsDTO | null>(null);

  featureSelected = output<void>();
  featureRemoved = output<void>();
  nameChanged = output<string>();
  targetDatatypeChanged = output<string>();
  selectionRemoved = output<SelectedDataIdsDTO>();
  selectionAdded = output<SelectedDataIdsDTO>();

  selectedSelectionKey: string | null = null;

  readonly selectionMap = computed(() => new Map(this.selectionOptions().map(selection => [selection.key, selection])));

  readonly assignedSelections = computed(() =>
    this.feature().allowedDataIds
      .map(selection => this.selectionMap().get(toSelectionKey(selection)))
      .filter((selection): selection is DatasetSelectionOption => !!selection)
  );

  readonly targetDatatypeOptions = computed(() => {
    const uniqueOptions = new Map<string, {value: string; label: string}>();

    for (const selection of this.assignedSelections()) {
      if (!uniqueOptions.has(selection.dataTypeId)) {
        uniqueOptions.set(selection.dataTypeId, {
          value: selection.dataTypeId,
          label: `${selection.dataTypeName} (${selection.dataTypeType ?? 'Unknown'})`,
        });
      }
    }

    return Array.from(uniqueOptions.values());
  });

  readonly needsTargetDatatypeSelection = computed(() => this.targetDatatypeOptions().length > 1);

  readonly resolvedTargetDatatypeId = computed(() => {
    const currentTarget = this.feature().targetDatatypeId;
    if (currentTarget != null) {
      return String(currentTarget);
    }

    if (this.targetDatatypeOptions().length === 1) {
      return this.targetDatatypeOptions()[0].value;
    }

    return null;
  });

  readonly autoTargetLabel = computed(() => {
    if (this.needsTargetDatatypeSelection()) {
      return null;
    }

    return this.targetDatatypeOptions()[0]?.label ?? null;
  });

  readonly clinicCoverage = computed(() =>
    Math.max(0, ...this.assignedSelections().map(selection => selection.clinicCount))
  );

  readonly statisticsCoverage = computed(() =>
    Math.max(0, ...this.assignedSelections().map(selection => selection.statisticsClinicCount))
  );
  readonly selectableOptions = computed(() => {
    const assignedKeys = new Set(this.feature().allowedDataIds.map(selection => toSelectionKey(selection)));
    return this.selectionOptions().filter(selection => !assignedKeys.has(selection.key));
  });

  updateName(name: string): void {
    this.nameChanged.emit(name);
  }

  updateTargetDatatype(targetDatatypeId: string): void {
    if (!targetDatatypeId) {
      return;
    }
    this.targetDatatypeChanged.emit(targetDatatypeId);
  }

  removeSelection(event: Event, selection: DatasetSelectionOption): void {
    event.stopPropagation();
    this.selectionRemoved.emit(selection.selection);
  }

  removeFeature(event: Event): void {
    event.stopPropagation();
    this.featureRemoved.emit();
  }

  addSelectionFromSelect(selectionKey: string | null): void {
    this.selectedSelectionKey = null;
    if (!selectionKey) {
      return;
    }

    const selection = this.selectionMap().get(selectionKey);
    if (!selection) {
      return;
    }

    this.selectionAdded.emit(selection.selection);
  }

  allowNativeDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  handleNativeDrop(event: DragEvent): void {
    const selection = readDatasetSelectionTransfer(event.dataTransfer) ?? this.draggedSelection();
    if (!selection) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.selectionAdded.emit(selection);
  }

  trackSelection(_index: number, selection: DatasetSelectionOption): string {
    return selection.key;
  }

  asPercent(value: number | null): string {
    if (value == null) {
      return 'n/a';
    }
    return `${Math.round(value * 100)}%`;
  }

  asNumber(value: number | null): string {
    if (value == null) {
      return 'n/a';
    }
    return Number(value.toFixed(2)).toString();
  }
}

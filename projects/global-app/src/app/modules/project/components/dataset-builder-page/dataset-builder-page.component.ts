import {CdkDragDrop, DragDropModule, moveItemInArray} from "@angular/cdk/drag-drop";
import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject, signal, untracked} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatCardModule} from "@angular/material/card";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatStepperModule} from "@angular/material/stepper";
import {Router} from "@angular/router";
import {QueryDTO, QueryOperatorDTO} from "@global-app/find-data/dto/query";
import {DataStatisticsResponseDTO, StatisticsColumnProfile} from "@global-app/find-data/dto/query-statistics";
import {QueryStatisticsResponseService} from "@global-app/find-data/services/query-statistics-response.service";
import {QueryService} from "@global-app/find-data/services/query.service";
import {
  DatasetPreviewColumn,
  DatasetPreviewRow,
  DatasetSelectionOption
} from "@global-app/project/components/dataset-builder-page/dataset-builder.models";
import {
  readDatasetSelectionTransfer,
  writeDatasetSelectionTransfer
} from "@global-app/project/components/dataset-builder-page/dataset-drag-drop.util";
import {
  DatasetFeatureCardComponent
} from "@global-app/project/components/dataset-builder-page/components/dataset-feature-card/dataset-feature-card.component";
import {
  DatasetPreviewComponent
} from "@global-app/project/components/dataset-builder-page/components/dataset-preview/dataset-preview.component";
import {ProjectActions} from "@global-app/project/store/project.actions";
import {selectLoading, selectSelectedProject} from "@global-app/project/store/project.selectors";
import {DataTypeDetailFlatten, DataTypeSubscriptionDTO, DummyDataRequestDTO} from "@global-app/schema/dto/datatype";
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {Store} from "@ngrx/store";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  SelectableDataCardComponent
} from "@global-app/schema/components/selectable-data-card/selectable-data-card.component";
import {
  DataExportConfigComponent
} from "@shared-lib/modules/data-modeler/components/data-export-config/data-export-config.component";
import {
  PatientDataExportConfigDTO,
  PatientExportFeatureDTO,
  SelectedDataIdsDTO
} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {
  flattenExportFeatures,
  normalizeExportFeature,
  toSelectionKey
} from "@shared-lib/modules/data-modeler/utils/patient-export-config.util";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-dataset-builder-page',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    BadgeComponent,
    SelectableDataCardComponent,
    DataExportConfigComponent,
    DatasetFeatureCardComponent,
    DatasetPreviewComponent,
    HeaderComponent,
    PageWrapperComponent,
    BtnComponent
  ],
  templateUrl: './dataset-builder-page.component.html',
  styleUrl: './dataset-builder-page.component.scss',
})
export class DatasetBuilderPageComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly queryService = inject(QueryService);
  private readonly dataTypeService = inject(DataTypeService);
  private readonly queryStatisticsResponseService = inject(QueryStatisticsResponseService);

  readonly project = this.store.selectSignal(selectSelectedProject);
  readonly projectLoading = this.store.selectSignal(selectLoading);

  readonly query = signal<QueryDTO | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly dataSelectionsLoading = signal<boolean>(false);
  readonly statisticsLoading = signal<boolean>(false);
  readonly selectionFilter = signal('');

  exportConfig = signal<PatientDataExportConfigDTO>({} as PatientDataExportConfigDTO);
  readonly datasetFeatures = signal<PatientExportFeatureDTO[]>([]);
  readonly rawSelectionOptions = signal<DatasetSelectionOption[]>([]);
  readonly statisticsResponses = signal<DataStatisticsResponseDTO[]>([]);
  readonly activeFeatureOrder = signal<number | null>(null);
  readonly draggedSelection = signal<DatasetSelectionOption | null>(null);

  readonly previewRows = signal<DatasetPreviewRow[]>([]);
  readonly previewColumns = signal<DatasetPreviewColumn[]>([]);
  readonly previewLoading = signal<boolean>(false);
  readonly previewError = signal<string | null>(null);
  readonly lastPreviewSignature = signal<string | null>(null);

  readonly featureCount = computed(() => this.datasetFeatures().length);
  readonly features = computed(() => this.datasetFeatures());
  readonly flattenedSelections = computed(() => flattenExportFeatures(this.features()));
  readonly hasConfiguredFeatures = computed(() =>
    this.features().some(feature => (feature.allowedDataIds?.length ?? 0) > 0)
  );
  readonly activeFeature = computed(() => {
    const activeOrder = this.activeFeatureOrder();
    if (activeOrder == null) {
      return null;
    }
    return this.features().find(feature => feature.order === activeOrder) ?? null;
  });

  readonly selectionOptions = computed(() => {
    const responses = this.statisticsResponses();

    return this.rawSelectionOptions().map(selection => {
      const statisticsProfiles = responses
        .map(response => response.statistics?.properties?.find(property => property.name === selection.dataTypeName))
        .filter((property): property is StatisticsColumnProfile => !!property);

      return {
        ...selection,
        statisticsProfiles,
        statisticsClinicCount: statisticsProfiles.length,
        averageMissingRate: this.averageMissingRate(statisticsProfiles),
        averageMean: this.averageMean(statisticsProfiles),
      };
    });
  });

  readonly filteredSelectionOptions = computed(() => {
    const search = this.selectionFilter().trim().toLowerCase();
    if (!search) {
      return this.selectionOptions();
    }

    return this.selectionOptions().filter(selection =>
      selection.dataTypeName.toLowerCase().includes(search)
      || selection.ontologyName.toLowerCase().includes(search)
      || (selection.dataTypeDescription || '').toLowerCase().includes(search)
    );
  });

  readonly featureAssignments = computed(() => {
    const assignments = new Map<string, string[]>();

    for (const feature of this.features()) {
      for (const selection of feature.allowedDataIds ?? []) {
        const key = toSelectionKey(selection);
        const current = assignments.get(key) ?? [];
        current.push(feature.name);
        assignments.set(key, current);
      }
    }

    return assignments;
  });
  readonly featureAssignmentOrders = computed(() => {
    const assignments = new Map<string, number[]>();

    for (const feature of this.features()) {
      for (const selection of feature.allowedDataIds ?? []) {
        const key = toSelectionKey(selection);
        const current = assignments.get(key) ?? [];
        current.push(feature.order);
        assignments.set(key, current);
      }
    }

    return assignments;
  });
  readonly assignedSelectionKeys = computed(() => new Set(this.flattenedSelections().map(selection => toSelectionKey(selection))));

  readonly previewSignature = computed(() => JSON.stringify({
    features: this.features(),
    exportMode: {
      appBased: this.exportConfig().appBased,
      wideFormat: this.exportConfig().wideFormat,
      globalAppVersionId: this.exportConfig().globalAppVersionId,
    }
  }));

  readonly previewDirty = computed(() => this.lastPreviewSignature() !== this.previewSignature());

  readonly queryResultSummary = computed(() => {
    const query = this.query();
    if (!query) {
      return 'Loading query';
    }

    if (!query.hasResult) {
      return 'Query has not been executed yet';
    }

    return `${query.result} matching patients`;
  });

  private readonly syncProjectConfigEffect = effect(() => {
    const project = this.project();
    if (!project) {
      return;
    }
    if (!project.exportConfig) {
      return;
    }
    this.exportConfig.set(project.exportConfig);
    this.datasetFeatures.set(project.exportConfig.features ?? []);
    untracked(() => this.ensureActiveFeature());
  });

  private readonly loadQueryEffect = effect((onCleanup) => {
    const project = this.project();
    if (!project?.queryId) {
      this.query.set(null);
      this.rawSelectionOptions.set([]);
      this.statisticsResponses.set([]);
      return;
    }

    this.loadError.set(null);
    const sub = this.queryService.get(project.queryId).subscribe({
      next: query => this.query.set(query),
      error: error => {
        this.loadError.set(error?.message ?? 'Failed to load project query.');
        this.query.set(null);
      }
    });

    onCleanup(() => sub.unsubscribe());
  });

  private readonly loadSelectionOptionsEffect = effect((onCleanup) => {
    const query = this.query();
    if (!query?.query?.length) {
      this.rawSelectionOptions.set([]);
      return;
    }

    this.dataSelectionsLoading.set(true);
    const requestedSelectionKeys = new Map<string, QueryDTO['query'][number]>();
    const ontologyIds = new Set<string>();

    for (const item of query.query) {
      requestedSelectionKeys.set(toSelectionKey({
        globalOntologyId: item.ontologyId,
        globalDataTypeId: item.dataTypeId,
      }), item);
      ontologyIds.add(item.ontologyId);
    }

    const sub = this.dataTypeService.getAllForQuery(Array.from(ontologyIds)).subscribe({
      next: subscriptions => {
        const availableDataTypeIds = Array.from(new Set(subscriptions.map(subscription => subscription.dataTypeId)));

        this.dataTypeService.getAllDetailedFlatten(undefined, availableDataTypeIds).subscribe({
          next: detailedTypes => {
            this.rawSelectionOptions.set(this.buildSelectionOptions(detailedTypes, subscriptions, requestedSelectionKeys));
            this.dataSelectionsLoading.set(false);
            this.ensureActiveFeature();
          },
          error: error => {
            this.loadError.set(error?.message ?? 'Failed to load available data selections.');
            this.rawSelectionOptions.set([]);
            this.dataSelectionsLoading.set(false);
          }
        });
      },
      error: error => {
        this.loadError.set(error?.message ?? 'Failed to load available data selections.');
        this.rawSelectionOptions.set([]);
        this.dataSelectionsLoading.set(false);
      }
    });

    onCleanup(() => sub.unsubscribe());
  });

  private readonly loadStatisticsEffect = effect((onCleanup) => {
    const query = this.query();
    if (!query?.id) {
      this.statisticsResponses.set([]);
      return;
    }

    this.statisticsLoading.set(true);
    const source$ = query.latestDataStatisticsRequest
      ? this.queryStatisticsResponseService.listForRequest(query.latestDataStatisticsRequest)
      : this.queryStatisticsResponseService.listForQuery(query.id);

    const sub = source$.subscribe({
      next: responses => {
        this.statisticsResponses.set(responses ?? []);
        this.statisticsLoading.set(false);
      },
      error: error => {
        this.loadError.set(error?.message ?? 'Failed to load query statistics.');
        this.statisticsResponses.set([]);
        this.statisticsLoading.set(false);
      }
    });

    onCleanup(() => sub.unsubscribe());
  });

  readonly selectedFeatureLabel = computed(() => this.activeFeature()?.name.trim() || 'No feature selected');
  readonly featureCreationDropLabel = computed(() => this.features().length
    ? 'Drop a data card here to create another feature, or use Add feature above.'
    : 'Drop a data card here to create your first feature, or use Add feature above.'
  );

  trackFeature(_index: number, feature: PatientExportFeatureDTO): string {
    return String(feature.order);
  }

  startSelectionDrag(selection: DatasetSelectionOption, event: DragEvent): void {
    this.draggedSelection.set(selection);
    if (!event.dataTransfer) {
      return;
    }

    event.dataTransfer.effectAllowed = 'copy';
    writeDatasetSelectionTransfer(event.dataTransfer, selection.selection);
  }

  finishSelectionDrag(): void {
    this.draggedSelection.set(null);
  }

  allowFeatureCreationDrop(event: DragEvent): void {
    if (!this.draggedSelection()) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  createFeatureFromDrop(event: DragEvent): void {
    const selection = this.resolveDroppedSelection(event);
    if (!selection) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.createFeatureFromSelection(selection);
    this.finishSelectionDrag();
  }

  goBackToProject(): void {
    const project = this.project();
    if (!project?.id) {
      return;
    }

    this.router.navigate(['/project', project.id], {fragment: 'data'});
  }

  addFeature(): void {
    this.updateFeatures(features => {
      const nextOrder = features.length;
      const nextFeature = normalizeExportFeature({
        name: '',
        allowedDataIds: [],
      }, nextOrder);

      this.activeFeatureOrder.set(nextOrder);
      return [...features, nextFeature];
    });
    this.snackBar.open('New feature draft added.', 'Close', {duration: 2200});
  }

  addAllAsFeatures(): void {
    const unassignedSelections = this.selectionOptions()
      .filter(selection => !this.assignedSelectionKeys().has(selection.key));

    if (!unassignedSelections.length) {
      this.snackBar.open('All available data selections are already part of a feature.', 'Close', {duration: 3000});
      return;
    }

    this.updateFeatures(features => {
      const nextFeatures = features.slice();

      for (const selection of unassignedSelections) {
        nextFeatures.push(normalizeExportFeature({
          name: this.createFeatureNameFromSelection(selection, nextFeatures),
          allowedDataIds: [selection.selection],
          targetDatatypeId: selection.dataTypeId,
        }, nextFeatures.length));
      }

      this.activeFeatureOrder.set(features.length);
      return nextFeatures;
    });
    this.snackBar.open(`${unassignedSelections.length} features created from available selections.`, 'Close', {duration: 2600});
  }

  createFeatureFromSelection(selection: DatasetSelectionOption): void {
    this.updateFeatures(features => {
      const nextOrder = features.length;
      const nextFeature = normalizeExportFeature({
        name: this.createFeatureName(selection.dataTypeName, features),
        allowedDataIds: [selection.selection],
        targetDatatypeId: selection.dataTypeId,
      }, nextOrder);

      this.activeFeatureOrder.set(nextOrder);
      return [...features, nextFeature];
    });
  }

  assignSelectionToActiveFeature(selection: DatasetSelectionOption): void {
    const activeFeature = this.activeFeature();
    if (!activeFeature) {
      this.createFeatureFromSelection(selection);
      return;
    }

    this.assignSelectionToFeature(activeFeature.order, selection.selection);
  }

  assignSelectionToFeature(order: number, selection: SelectedDataIdsDTO): void {
    const selectionKey = toSelectionKey(selection);

    this.updateFeature(order, feature => {
      const alreadyIncluded = feature.allowedDataIds.some(dataId => toSelectionKey(dataId) === selectionKey);
      if (alreadyIncluded) {
        return feature;
      }

      return {
        ...feature,
        allowedDataIds: [...feature.allowedDataIds, selection],
      };
    });
  }

  removeFeature(order: number): void {
    this.updateFeatures(features => features.filter(feature => feature.order !== order));
  }

  focusFeature(order: number): void {
    this.activeFeatureOrder.set(order);
  }

  renameFeature(order: number, name: string): void {
    this.updateFeature(order, feature => ({
      ...feature,
      name,
    }));
  }

  changeFeatureTargetDatatype(order: number, targetDatatypeId: string): void {
    this.updateFeature(order, feature => ({
      ...feature,
      targetDatatypeId,
    }));
  }

  removeSelectionFromFeature(order: number, selection: SelectedDataIdsDTO): void {
    this.updateFeature(order, feature => ({
      ...feature,
      allowedDataIds: feature.allowedDataIds.filter(dataId => toSelectionKey(dataId) !== toSelectionKey(selection)),
    }));
  }

  dropFeature(event: CdkDragDrop<PatientExportFeatureDTO[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    this.updateFeatures(features => {
      const reordered = features.slice();
      moveItemInArray(reordered, event.previousIndex, event.currentIndex);
      this.activeFeatureOrder.set(event.currentIndex);
      return reordered;
    });
  }

  isSelectionInActiveFeature(selectionKey: string): boolean {
    const activeFeature = this.activeFeature();
    if (!activeFeature) {
      return false;
    }

    return activeFeature.allowedDataIds.some(selection => toSelectionKey(selection) === selectionKey);
  }

  assignedFeatureNames(selectionKey: string): string[] {
    return this.featureAssignments().get(selectionKey) ?? [];
  }

  focusFeatureFromSelection(selectionKey: string, event?: Event): void {
    event?.stopPropagation();
    const order = this.featureAssignmentOrders().get(selectionKey)?.[0];
    if (order == null) {
      return;
    }

    this.focusFeature(order);
    requestAnimationFrame(() => {
      const element = document.getElementById(`dataset-feature-${order}`);
      element?.scrollIntoView({behavior: 'smooth', block: 'center'});
    });
  }

  saveDesign(): void {
    const project = this.project();
    if (!project) {
      return;
    }

    const exportConfig = {
      ...this.exportConfig(),
      features: this.features().map((feature, index) => ({
        ...feature,
        name: feature.name.trim() || `Feature ${index + 1}`,
      }))
    };
    this.exportConfig.set(exportConfig);
    this.datasetFeatures.set(exportConfig.features ?? []);

    this.store.dispatch(ProjectActions.update({
      project: {
        ...project,
        exportConfig,
      }
    }));

    this.snackBar.open('Dataset design saved to the project.', 'Close', {duration: 3500});
  }

  refreshPreview(): void {
    const features = this.features()
      .map((feature, index) => normalizeExportFeature(feature, index))
      .filter(feature => feature.allowedDataIds.length > 0)
      .map((feature, index) => ({
        ...feature,
        name: feature.name.trim() || `Feature ${index + 1}`,
        order: index,
      }));
    const selectedDataIds = flattenExportFeatures(features);
    const wideFormat = this.exportConfig().wideFormat ?? false;

    if (selectedDataIds.length === 0) {
      this.previewRows.set([]);
      this.previewColumns.set([]);
      this.previewError.set(null);
      return;
    }

    this.previewLoading.set(true);
    this.previewError.set(null);

    const request: DummyDataRequestDTO = {
      features,
      amount: 12,
      asFile: false,
      wideFormat,
    };

    this.dataTypeService.generateDummyData(request).subscribe({
      next: rows => {
        if (!rows.length) {
          this.previewColumns.set([]);
          this.previewRows.set([]);
        } else if (wideFormat) {
          const columns = features.map((feature, index) => ({
            id: `feature_${index}`,
            label: feature.name.trim() || `Feature ${index + 1}`,
          }));

          const previewRows = rows.map(row => this.buildPreviewRow(row as Record<string, unknown>, features, columns));
          this.previewColumns.set(columns);
          this.previewRows.set(previewRows);
        } else {
          const firstRow = rows[0] as Record<string, unknown>;
          const columns = Object.keys(firstRow).map(column => ({
            id: column,
            label: column,
          }));
          const previewRows = rows.map(row => this.buildRawPreviewRow(row as Record<string, unknown>, columns));
          this.previewColumns.set(columns);
          this.previewRows.set(previewRows);
        }
        this.previewLoading.set(false);
        this.lastPreviewSignature.set(this.previewSignature());
      },
      error: error => {
        this.previewError.set(error?.message ?? 'Failed to generate preview data.');
        this.previewRows.set([]);
        this.previewColumns.set([]);
        this.previewLoading.set(false);
      }
    });
  }

  downloadPreview(): void {
    if (!this.previewColumns().length || !this.previewRows().length) {
      return;
    }

    const header = this.previewColumns().map(column => this.escapeCsv(column.label)).join(',');
    const lines = this.previewRows().map(row =>
      this.previewColumns()
        .map(column => this.escapeCsv(row[column.id]))
        .join(',')
    );

    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dataset-preview-${this.project()?.id ?? 'project'}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private updateFeature(order: number, updater: (feature: PatientExportFeatureDTO) => PatientExportFeatureDTO): void {
    this.updateFeatures(features => features.map(feature =>
      feature.order === order ? updater(feature) : feature
    ));
  }

  private resolveDroppedSelection(event: DragEvent): DatasetSelectionOption | null {
    const currentSelection = this.draggedSelection();
    if (currentSelection) {
      return currentSelection;
    }

    const transferredSelection = readDatasetSelectionTransfer(event.dataTransfer);
    if (!transferredSelection) {
      return null;
    }

    const transferredKey = toSelectionKey(transferredSelection);
    return this.selectionOptions().find(selection => selection.key === transferredKey) ?? null;
  }

  private updateFeatures(updater: (features: PatientExportFeatureDTO[]) => PatientExportFeatureDTO[]): void {
    const currentFeatures = this.features().map((feature, index) => normalizeExportFeature(feature, index));
    const nextFeatures = updater(currentFeatures)
      .map((feature, index) => normalizeExportFeature(feature, index));

    this.datasetFeatures.set(nextFeatures);

    const nextConfig = {
      ...this.exportConfig(),
      features: nextFeatures,
    };

    this.exportConfig.set(nextConfig);
    this.ensureActiveFeature();
  }

  private ensureActiveFeature(): void {
    const features = this.features();
    const activeOrder = this.activeFeatureOrder();

    if (!features.length) {
      this.activeFeatureOrder.set(null);
      return;
    }

    if (activeOrder == null || !features.some(feature => feature.order === activeOrder)) {
      this.activeFeatureOrder.set(features[0].order);
    }
  }

  private buildSelectionOptions(
    details: DataTypeDetailFlatten[],
    subscriptions: DataTypeSubscriptionDTO[],
    requestedSelectionKeys: Map<string, QueryDTO['query'][number]>
  ): DatasetSelectionOption[] {
    const subscriptionMap = new Map(subscriptions.map(subscription => [subscription.dataTypeId, subscription.subscriptionsCount]));

    return details
      .flatMap(detail => {
        if (!detail.id || !detail.ontology?.id) {
          return [];
        }

        const ontologyId = detail.ontology.id;
        const selection = {
          globalOntologyId: ontologyId,
          globalDataTypeId: detail.id,
        } satisfies SelectedDataIdsDTO;
        const key = toSelectionKey(selection);
        const queryItem = requestedSelectionKeys.get(key);
        const ontologyQueryItem = queryItem ?? Array.from(requestedSelectionKeys.values()).find(
          item => item.ontologyId === ontologyId
        );

        return [{
          key,
          selection,
          dataTypeNode: detail,
          ontologyNode: detail.ontology,
          dataTypeName: detail.name,
          dataTypeDescription: detail.description,
          dataTypeId: detail.id,
          dataTypeType: detail.type,
          ontologyName: detail.ontology.names?.[0] ?? ontologyId,
          ontologyDescription: detail.ontology.description ?? null,
          ontologyId: ontologyId,
          clinicCount: subscriptionMap.get(detail.id) ?? detail.subscriptionsCount ?? 0,
          querySummary: ontologyQueryItem
            ? this.formatQuerySummary(ontologyQueryItem.operator)
            : 'Available through the current project query',
          queryOperators: ontologyQueryItem
            ? ontologyQueryItem.operator.map(operator => this.formatQueryOperator(operator))
            : [],
          statisticsProfiles: [],
          statisticsClinicCount: 0,
          averageMissingRate: null,
          averageMean: null,
        } satisfies DatasetSelectionOption];
      })
      .sort((a, b) => b.clinicCount - a.clinicCount || a.dataTypeName.localeCompare(b.dataTypeName));
  }

  private toSnakeCase(name: string): string {
    return name
      .trim()
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase() || 'feature';
  }

  private createFeatureNameFromSelection(selection: DatasetSelectionOption, features: PatientExportFeatureDTO[]): string {
    const existingNames = new Set(features.map(f => f.name.trim().toLowerCase()));

    const ontologyCandidate = this.toSnakeCase(selection.ontologyName);
    if (!existingNames.has(ontologyCandidate)) {
      return ontologyCandidate;
    }

    const combinedCandidate = this.toSnakeCase(`${selection.ontologyName}_${selection.dataTypeName}`);
    if (!existingNames.has(combinedCandidate)) {
      return combinedCandidate;
    }

    let counter = 2;
    while (existingNames.has(`${combinedCandidate}_${counter}`)) {
      counter++;
    }
    return `${combinedCandidate}_${counter}`;
  }

  private createFeatureName(baseName: string, features: PatientExportFeatureDTO[]): string {
    const normalizedBase = baseName.trim() || 'Feature';
    const existingNames = new Set(features.map(feature => feature.name.trim().toLowerCase()));

    if (!existingNames.has(normalizedBase.toLowerCase())) {
      return normalizedBase;
    }

    let counter = 2;
    while (existingNames.has(`${normalizedBase} ${counter}`.toLowerCase())) {
      counter += 1;
    }

    return `${normalizedBase} ${counter}`;
  }

  private buildPreviewRow(
    rawRow: Record<string, unknown>,
    features: PatientExportFeatureDTO[],
    columns: DatasetPreviewColumn[]
  ): DatasetPreviewRow {
    const previewRow: DatasetPreviewRow = {};

    features.forEach((feature, index) => {
      const values = this.getFeaturePreviewValues(rawRow, feature, index);

      const formattedValue = values.length === 0
        ? null
        : values.length === 1
          ? this.formatPreviewValue(values[0])
          : values.map(value => this.formatPreviewValue(value)).join(' | ');

      previewRow[columns[index].id] = formattedValue;
    });

    return previewRow;
  }

  private getFeaturePreviewValues(
    rawRow: Record<string, unknown>,
    feature: PatientExportFeatureDTO,
    index: number
  ): unknown[] {
    const name = feature.name.trim();
    const directKeys = Array.from(new Set([
      name,
      this.toSnakeCase(name),
      `feature_${index}`,
      `feature_${feature.order}`,
      String(feature.order),
    ].filter(Boolean)));

    const directValues = directKeys
      .filter(key => Object.prototype.hasOwnProperty.call(rawRow, key))
      .map(key => rawRow[key])
      .filter(value => value !== undefined && value !== null && value !== '');

    if (directValues.length > 0) {
      return directValues;
    }

    return feature.allowedDataIds
      .map(selection => rawRow[`${selection.globalOntologyId}@${selection.globalDataTypeId}`])
      .filter(value => value !== undefined && value !== null && value !== '');
  }

  private buildRawPreviewRow(
    rawRow: Record<string, unknown>,
    columns: DatasetPreviewColumn[]
  ): DatasetPreviewRow {
    const previewRow: DatasetPreviewRow = {};

    for (const column of columns) {
      previewRow[column.id] = this.formatPreviewValue(rawRow[column.id]);
    }

    return previewRow;
  }

  private formatPreviewValue(value: unknown): string | number | boolean | null {
    if (value == null) {
      return null;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.join(' | ');
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  private formatQuerySummary(operators: QueryOperatorDTO[]): string {
    if (!operators.length) {
      return 'No additional query filter';
    }

    return operators.map(operator => this.formatQueryOperator(operator)).join(' | ');
  }

  private formatQueryOperator(operator: QueryOperatorDTO): string {
    const value = Array.isArray(operator.value) ? operator.value.join(', ') : operator.value;
    if (value == null || value === '') {
      return operator.operator;
    }
    return `${operator.operator}: ${value}`;
  }

  private averageMissingRate(profiles: StatisticsColumnProfile[]): number | null {
    if (!profiles.length) {
      return null;
    }

    const rates = profiles
      .filter(profile => profile.count > 0)
      .map(profile => profile.missing / profile.count);

    if (!rates.length) {
      return null;
    }

    return rates.reduce((sum, value) => sum + value, 0) / rates.length;
  }

  private averageMean(profiles: StatisticsColumnProfile[]): number | null {
    const means = profiles
      .map(profile => profile.mean)
      .filter((value): value is number => value != null && Number.isFinite(value));

    if (!means.length) {
      return null;
    }

    return means.reduce((sum, value) => sum + value, 0) / means.length;
  }

  private escapeCsv(value: string | number | boolean | null | undefined): string {
    if (value == null) {
      return '""';
    }

    const escaped = String(value).replace(/"/g, '""');
    return `"${escaped}"`;
  }

  protected readonly untracked = untracked;
}

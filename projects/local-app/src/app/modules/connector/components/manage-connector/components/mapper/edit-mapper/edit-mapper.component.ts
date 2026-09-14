import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {ConnectorSelectMapperComponent, ConnectorSelectMapperResult} from "../select-mapper/select-mapper.component";
import {ConnectorPreviewService} from "../../../../../services/connector-preview.service";
import {ConnectorMappingConfig} from "../../../../../models/connector-model";
import {ConnectorMappingElement} from "../../../../../models/connector-preview";
import {getArrayOrString, isArray, ListViewComponentDialogComponent} from "../../table/list-view/list-view.component";
import {ActivatedRoute, Data} from "@angular/router";
import {CohortDetailDto} from '@local-app/cohort/models';
import {
  TimeSeriesMappingDialogComponent,
  TimeSeriesMappingDialogComponentData,
  TimeSeriesMappingDialogComponentResult
} from '../time-series-mapping-dialog/time-series-mapping-dialog.component';
import {toSignal} from "@angular/core/rxjs-interop";
import {map, Subscription} from "rxjs";
import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from "@local-app/cohort/dto/schema";
import {UNIQUE_PATIENT_ID_NODE} from '@local-app/utils/constants/unique-patient-id-node';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ConnectorPreviewMapperComponent} from '../preview-mapper/preview-mapper.component';
import {TranslatePipe} from '@ngx-translate/core';
import {MAPPING_PREVIEW_FRAGMENT} from '../../../../../constansts/mapping.constants';
import {
  PreviewValidationRequestDTO,
  PreviewValidationResponseDTO,
  PreviewValidationResponseElementDTO,
  PreviewValidationWarningDTO
} from '../../../../../dto/connector-validation';
import {ConnectorMappingMode, ConnectorMappingValidationExample,} from '../../../../../models/connector-value-mapping';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {SkeletonLoaderComponent} from '@shared-lib/components/skeleton-loader/skeleton-loader.component';
import {ConnectorDTO, ConnectorMappingDTO} from '../../../../../dto/connector';
import {configToConnectorDTO} from '../../../../../models/connector-config';

type RouteData = Data & { breadcrumb: string | any, cohort: CohortDetailDto }

@Component({
  selector: 'app-edit-mapper',
  templateUrl: './edit-mapper.component.html',
  styleUrl: './edit-mapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabGroup, MatTab, MatToolbar, MatButtonToggleGroup, FormsModule, MatButtonToggle, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatIconButton, MatIcon, MatButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatTooltip, ConnectorPreviewMapperComponent, TranslatePipe, BadgeComponent, BtnComponent, InfoCardComponent, SkeletonLoaderComponent]
})
export class ConnectorEditMapperComponent implements OnInit, OnDestroy {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly connectorPreviewService: ConnectorPreviewService = inject(ConnectorPreviewService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  displayedColumns: string[] = ['column', 'data', 'mapping', 'time_series_mapping'];

  columns = input<string[]>([]);
  inputData = input<any[]>([]);
  validationConfig = input<ConnectorDTO | undefined>(undefined);
  config = model<ConnectorMappingConfig[] | undefined>([]);

  patientIdConflictColumn = input<string | undefined>(undefined);
  cardDetail = output<string>();

  cachedConfig: ConnectorMappingConfig[] = [];
  private lastInputSignature = '';
  private lastValidationSignature = '';
  private validationRequestId = 0;
  private validationSubscription?: Subscription;
  private readonly previewValidationResults = signal<PreviewValidationResponseDTO[]>([]);
  private readonly previewValidationLoadingColumns = signal<ReadonlySet<string>>(new Set());
  readonly validationLoading = signal(true);

  filterMapped = model<string[]>([]);
  filterMappedStatus = model<string[]>([]);

  readonly mappedCount = computed(() => this.dataSource().filter(element => this.isElementMapped(element)).length);
  readonly unmappedCount = computed(() => this.dataSource().filter(element => !this.isElementMapped(element) && !element.disabled).length);
  readonly validCount = computed(() =>
    this.dataSource().filter(element => this.getValidationState(element) === 'VALID').length
  );
  readonly invalidCount = computed(() =>
    this.dataSource().filter(element =>
      this.isElementMapped(element) && this.getValidationState(element) === 'WARNING'
    ).length
  );
  readonly pendingCount = computed(() =>
    this.dataSource().filter(element => this.getValidationState(element) === 'SYNC').length
  );
  readonly completionPercentage = computed(() => {
    const total = this.dataSource().filter(element => !element.disabled).length;
    if (!total) {
      return 0;
    }
    return Math.round((this.mappedCount() / total) * 100);
  });

  selectedTabIndex = signal(0);
  dataSource = signal<ConnectorMappingElement[]>([]);
  tableDataSource = computed(() => {
    return this.dataSource().filter(element => {
      const mapped = this.filterMapped();
      const mappedCondition =
        mapped.length === 0 ||
        mapped.length === 2 ||
        (mapped.includes('Mapped') && this.isElementMapped(element)) ||
        (mapped.includes('Unmapped') && !this.isElementMapped(element));

      if (!mappedCondition) return false;

      const status = this.filterMappedStatus();
      return status.length === 0 ||
        status.length === 2 ||
        (status.includes('Valid') && this.getValidationState(element) === 'VALID') ||
        (status.includes('Invalid') && this.getValidationState(element) === 'WARNING');
    });
  });

  //TODO BIG TODO WE NEED TO MAKE THIS AT SUB TIME
  readonly cohort = toSignal(
    this.activatedRoute.data.pipe(
      map((d: Data) => {
        const rd = d as RouteData;
        const uniquePatientIdNode: SchemaNodeNestedDto = UNIQUE_PATIENT_ID_NODE;

        const exists = rd.cohort.schemaRoot.childNodes
          .some(child => child.globalId === uniquePatientIdNode.globalId);

        if (!exists) {
          rd.cohort.schemaRoot.childNodes.push(uniquePatientIdNode);
        }

        return rd.cohort;
      })
    ),
    {initialValue: undefined}
  );

  private readonly flattenedSchemaFields = computed(() => {
    const cohort = this.cohort();
    if (!cohort?.schemaRoot?.childNodes?.length) {
      return [];
    }

    const collectLeafFields = (nodes: SchemaNodeNestedDto[], path: string[] = []): {
      displayValue: string;
      value: string;
      schemaId: number;
      normalizedLeafName: string;
    }[] => {
      return nodes.flatMap(node => {
        const currentPath = [...path, node.name];

        if (node.nodeType === SchemaNodeTypeEnum.ATTRIBUTE) {
          return [{
            displayValue: currentPath.join(' > '),
            value: currentPath.join('.'),
            schemaId: node.id,
            normalizedLeafName: this.normalizeValue(node.name),
          }];
        }

        return collectLeafFields(node.childNodes ?? [], currentPath);
      });
    };

    return collectLeafFields(cohort.schemaRoot.childNodes);
  });

  private sourceDataEffect = effect(() => {
    const cols = this.columns();
    const rows = this.inputData();
    if (!cols?.length || !rows?.length) {
      return;
    }

    const signature = this.buildInputSignature(cols, rows);
    if (signature === this.lastInputSignature) {
      return;
    }

    const preserveMappings = this.lastInputSignature !== '';
    this.lastInputSignature = signature;

    untracked(() => this.rebuildDataSourceFromInput(cols, rows, preserveMappings));
  });

  private configEffect = effect(() => {
    const newConfig = this.config();
    const ds = this.dataSource();

    if (!newConfig?.length || !ds.length) return;
    if (JSON.stringify(newConfig) === JSON.stringify(this.cachedConfig)) return;

    untracked(() => this.applyConfig(newConfig));
  });

  ngOnInit(): void {
    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment === MAPPING_PREVIEW_FRAGMENT) {
        this.selectedTabIndex.set(1);
      }
    });
  }

  ngOnDestroy(): void {
    this.validationRequestId++;
    this.validationSubscription?.unsubscribe();
  }

  viewSelectedColumn(element: ConnectorMappingElement) {
    const relatedValueMapping = element.valueMappingConfig
      ?? this.findValueMappingForValueColumn(element.column)?.valueMappingConfig;
    const sourceColumn = relatedValueMapping?.valueColumn ?? element.column;
    const sourceElement = this.dataSource().find(row => row.column === sourceColumn) ?? element;
    const excludedPaths = new Set(relatedValueMapping?.valueMappings.map(mapping => mapping.value) ?? []);
    const dialogRef = this.dialog.open(ConnectorSelectMapperComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      minWidth: '980px',
      minHeight: '40vh',
      height: '80vh',
      width: '90vw',
      autoFocus: false,
      data: {
        column: sourceColumn,
        value: sourceElement.mappingConfig?.value,
        cohort: structuredClone(this.cohort()),
        removeFieldsPath: this.getUsedPaths().filter(path => !excludedPaths.has(path)),
        columns: this.columns(),
        rows: this.inputData(),
        previewValidation: this.previewValidationResults,
        validationSummary: relatedValueMapping?.validationSummary ?? sourceElement.validationSummary,
        unavailableColumns: this.dataSource()
          .filter(row => row.column !== relatedValueMapping?.mappingColumn)
          .filter(row => row.column !== sourceColumn)
          .filter(row => this.isElementMapped(row) || !!row.disabled)
          .map(row => row.column),
        valueMappingConfig: relatedValueMapping,
      }
    });
    dialogRef.afterClosed().subscribe((result: ConnectorSelectMapperResult) => {
      if (!result) return;

      this.applyMappingResult(sourceColumn, result);
      this.refreshDataSource();
      this.onChangeMapping();
    });
  }

  suggestMappings(): void {
    const schemaFields = this.flattenedSchemaFields();
    if (!schemaFields.length) {
      return;
    }

    const updatedElements: ConnectorMappingElement[] = [];

    this.dataSource.update(rows => rows.map(row => {
      if (row.disabled || this.isElementMapped(row)) {
        return row;
      }

      const normalizedColumn = this.normalizeValue(row.column);
      if (!normalizedColumn) {
        return row;
      }

      const matches = schemaFields.filter(field => field.normalizedLeafName === normalizedColumn);
      if (matches.length !== 1) {
        return row;
      }

      const match = matches[0];
      const updatedRow: ConnectorMappingElement = {
        ...row,
        mapping: match.displayValue,
        mappingConfig: {
          displayValue: match.displayValue,
          value: match.value,
          schemaId: match.schemaId,
        },
        validation: 'Sync',
      };

      updatedElements.push(updatedRow);
      return updatedRow;
    }));

    if (!updatedElements.length) {
      return;
    }

    this.validateColumns(updatedElements);
    this.onChangeMapping();
  }

  viewTimeSeriesMapping(element: ConnectorMappingElement): void {
    const dialogRef = this.dialog.open(TimeSeriesMappingDialogComponent, {
      data: {
        column: element.column,
        visitColumn: element.visitIdMapping,
        visitTimestampColumn: element.visitTimestampMapping,
        timestampFormat: element.visitTimestampFormat,
        columns: this.columns().filter((column) => column !== element.column),
      } as TimeSeriesMappingDialogComponentData
    });
    dialogRef.afterClosed().subscribe((result: TimeSeriesMappingDialogComponentResult) => {
      if (!result) return;
      element.visitIdMapping = result.visitColumn;
      element.visitTimestampMapping = result.visitTimestampColumn;
      element.visitTimestampFormat = result.timestampFormat;
      this.refreshDataSource();
      this.onChangeMapping();
      if (result.mapToAll) {
        this.applyTimeSeriesForAll(result);
      }
      this.ignoreTimeSeriesForAll();
    });
  }

  getTimeSeriesMappingName(element: ConnectorMappingElement) {
    if (element.visitIdMapping && element.visitTimestampMapping) return element.visitIdMapping + ' / ' + element.visitTimestampMapping;
    if (element.visitIdMapping) return element.visitIdMapping;
    if (element.visitTimestampMapping) return '/ ' + element.visitTimestampMapping;
    return 'Mapping';
  }

  private rebuildDataSourceFromInput(cols: string[], rows: any[], preserveMappings: boolean): void {
    const existingByColumn = preserveMappings
      ? new Map(this.dataSource().map(row => [row.column, row]))
      : new Map<string, ConnectorMappingElement>();

    const nextRows: ConnectorMappingElement[] = cols.map(column => {
      const existing = existingByColumn.get(column);
      if (existing) {
        return {
          ...existing,
          data: this.getSampleData(rows, column),
          validation: existing.validationSummary
            ? existing.validation
            : existing.mappingConfig ? 'Sync' : existing.validation,
        };
      }

      return {
        column,
        data: this.getSampleData(rows, column),
        mapping: 'Mapping',
        validation: '',
      } as ConnectorMappingElement;
    });

    this.dataSource.set(nextRows);

    if (!preserveMappings) {
      this.validateColumns(nextRows);
      return;
    }

    const mappedElements = nextRows.filter(
      element => (!!element.mappingConfig?.value || !!element.valueMappingConfig)
        && !element.validationSummary
    );
    this.validateColumns(mappedElements.length ? mappedElements : nextRows);
  }

  private buildInputSignature(cols: string[], rows: any[]): string {
    if (!cols?.length || !rows?.length) {
      return '';
    }

    const sample = cols.map(column => rows[0]?.[column] ?? '').join('\0');
    return `${cols.join('\0')}\0${sample}`;
  }

  validateColumns(_elements: ConnectorMappingElement[]) {
    const cohort = this.cohort();
    const validationConfig = this.validationConfig();
    if (!cohort || !validationConfig?.inputConfig) {
      this.validationLoading.set(false);
      return;
    }

    const schemaMapping = this.buildCurrentSchemaMapping();
    const connector = configToConnectorDTO({
      ...validationConfig,
      cohortId: cohort.id,
      schemaMapping,
    });
    const request: PreviewValidationRequestDTO = {
      elements: this.flattenedSchemaFields().map(field => ({
        schemaId: field.schemaId,
        mapping: field.value,
      })),
      cohortId: cohort.id,
      inputConfig: connector.inputConfig,
      uploadInfo: connector.uploadInfo,
      schemaMapping: connector.schemaMapping,
      mergeConfig: connector.mergeConfig,
      pivotConfig: connector.pivotConfig,
      transformer: connector.transformer,
    };

    const signature = JSON.stringify(request);
    if (signature === this.lastValidationSignature) {
      this.validationLoading.set(false);
      return;
    }
    this.lastValidationSignature = signature;
    const requestId = ++this.validationRequestId;
    this.validationSubscription?.unsubscribe();
    this.previewValidationResults.set([]);
    this.previewValidationLoadingColumns.set(new Set());

    this.validationSubscription = this.connectorPreviewService
      .validatePreview(request)
      .subscribe({
        next: result => {
          if (requestId !== this.validationRequestId) return;
          this.upsertPreviewValidation(result);
          this.validationLoading.set(false);
        },
        error: () => {
          if (requestId === this.validationRequestId) {
            this.previewValidationLoadingColumns.set(new Set());
            this.clearPendingValidationState('Validation failed');
            this.validationLoading.set(false);
          }
        },
        complete: () => {
          if (requestId !== this.validationRequestId) return;
          this.previewValidationLoadingColumns.set(new Set());
          this.applyPreviewValidation(this.previewValidationResults(), true);
          this.validationLoading.set(false);
        },
      });
  }

  applyConfig(newConfig: ConnectorMappingConfig[] | undefined) {
    if (!newConfig || newConfig.length === 0) {
      return;
    }
    if (JSON.stringify(newConfig) === JSON.stringify(this.cachedConfig)) return;

    const ds = this.dataSource();
    const foundedColumn: ConnectorMappingElement[] = [];
    const timeBasedColumns: string[] = [];

    ds.forEach(element => {
      const config = newConfig.find(cfg => cfg.column === element.column);
      if (config) {
        if (config.mapping) {
          element.mappingConfig = {
            displayValue: config.mapping,
            value: config.mapping,
            schemaId: config.schemaId
          };
          element.mapping = config.mapping.replaceAll('.', ' > ');
          element.validationSummary = config.validationSummary;
          if (config.validationSummary) this.applyValidationSummary(element, config.validationSummary);
        }
        if (config.valueMappingConfig) {
          element.valueMappingConfig = structuredClone(config.valueMappingConfig);
          element.validationSummary = config.valueMappingConfig.validationSummary;
          if (element.validationSummary) this.applyValidationSummary(element, element.validationSummary);
          element.mapping = this.getMappingSummary(element);
        }

        //Time based init
        if (config.visitTimestampMapping) element.visitTimestampMapping = config.visitTimestampMapping;
        if (config.visitIdMapping) element.visitIdMapping = config.visitIdMapping;
        if (config.timestampFormat) element.visitTimestampFormat = config.timestampFormat;
        if (config.visitIdMapping && !timeBasedColumns.includes(config.visitIdMapping)) {
          timeBasedColumns.push(config.visitIdMapping);
        }
        if (config.visitTimestampMapping && !timeBasedColumns.includes(config.visitTimestampMapping)) {
          timeBasedColumns.push(config.visitTimestampMapping);
        }

        foundedColumn.push(element);
      }
    });
    ds.forEach(row => {
      row.disabled = timeBasedColumns.includes(row.column);
      if (row.disabled) {
        row.visitIdMapping = undefined;
        row.visitTimestampMapping = undefined;
        row.visitTimestampFormat = undefined;
        row.mappingConfig = undefined;
        row.valueMappingConfig = undefined;
        row.validationSummary = undefined;
      }
      return row;
    })
    this.dataSource.set([...ds]);
    this.validateColumns(foundedColumn.filter(element => !element.validationSummary));
    this.onChangeMapping();
  }

  applyTimeSeriesForAll(result: TimeSeriesMappingDialogComponentResult) {
    this.dataSource.update((rows) => {
      return rows.map(row => {
        row.visitIdMapping = result.visitColumn;
        row.visitTimestampMapping = result.visitTimestampColumn;
        row.visitTimestampFormat = result.visitTimestampColumn;
        return row;
      })
    });
  }

  ignoreTimeSeriesForAll() {
    const columns: string[] = [];
    this.dataSource().forEach(element => {
      if (element.visitIdMapping && !columns.includes(element.visitIdMapping)) {
        columns.push(element.visitIdMapping);
      }
      if (element.visitTimestampMapping && !columns.includes(element.visitTimestampMapping)) {
        columns.push(element.visitTimestampMapping);
      }
    });

    this.dataSource.update((rows) => {
      return rows.map(row => {
        row.disabled = columns.includes(row.column);
        if (row.valueMappingConfig
          && (columns.includes(row.valueMappingConfig.mappingColumn)
            || columns.includes(row.valueMappingConfig.valueColumn))) {
          row.valueMappingConfig = undefined;
          row.validationSummary = undefined;
          row.mapping = 'Mapping';
        }
        if (row.disabled) {
          row.visitIdMapping = undefined;
          row.visitTimestampMapping = undefined;
          row.visitTimestampFormat = undefined;
          row.mappingConfig = undefined;
          row.valueMappingConfig = undefined;
          row.validationSummary = undefined;
        }
        return row;
      })
    });
  }

  private refreshDataSource(): void {
    this.dataSource.set([...this.dataSource()]);
  }

  onChangeMapping() {
    const mappingConfig: ConnectorMappingConfig[] = [];
    this.dataSource().forEach(element => {
      if (element.mappingConfig) {
        mappingConfig.push(
          {
            column: element.column,
            mapping: element.mappingConfig.value,
            visitIdMapping: element.visitIdMapping ?? undefined,
            visitTimestampMapping: element.visitTimestampMapping ?? undefined,
            timestampFormat: element.visitTimestampFormat ?? undefined,
            schemaId: element.mappingConfig.schemaId ?? undefined,
            validationSummary: element.validationSummary,
          });
      }
      if (element.valueMappingConfig) {
        mappingConfig.push({
          column: element.column,
          visitIdMapping: element.visitIdMapping ?? undefined,
          visitTimestampMapping: element.visitTimestampMapping ?? undefined,
          timestampFormat: element.visitTimestampFormat ?? undefined,
          valueMappingConfig: structuredClone(element.valueMappingConfig),
        });
      }
    });

    if (JSON.stringify(mappingConfig) !== JSON.stringify(this.cachedConfig)) {
      this.cachedConfig = mappingConfig;
      this.config.set(mappingConfig);
    }
    this.cardDetail.emit(this.getCardDetail(this.cachedConfig));
  }

  getUsedPaths(): string[] {
    const paths: string[] = [];
    this.dataSource().forEach(element => {
      if (element.mappingConfig) paths.push(element.mappingConfig.value);
      if (element.valueMappingConfig) {
        paths.push(...element.valueMappingConfig.valueMappings.map(mapping => mapping.value));
      }
    });
    return paths;
  }

  private getInformationString(name: string, value: any, newline = false, strong = true) {
    let content = '';
    if (newline) content = `<br>`;
    if (strong) content += `<span><strong>${name}:</strong> ${value}</span>`;
    else content += `<span>${name}: ${value}</span>`;
    return content;
  }

  getCardDetail(_mappingConfig: ConnectorMappingConfig[]): string {
    let content = '';
    const mapped = this.mappedCount();
    const unmapped = this.unmappedCount();
    if (mapped > 0) {
      content += this.getInformationString('Mapped Fields', mapped);
      if (this.validCount() > 0) content += this.getInformationString('Valid', this.validCount(), true, false);
      if (this.invalidCount() > 0) content += this.getInformationString('Invalid', this.invalidCount(), true, false);
      if (this.pendingCount() > 0) content += this.getInformationString('Pending', this.pendingCount(), true, false);
    }
    if (unmapped > 0) content += this.getInformationString('Unmapped Fields', unmapped, true);
    return content;
  }

  getValue(data: any): string {
    if (data === null || data === undefined) return '';
    return getArrayOrString(data, 0);
  }

  private getSampleData(rows: any[], column: string): any {
    const firstRowValue = rows[0]?.[column];

    if (!this.isEmptySampleValue(firstRowValue)) {
      return firstRowValue;
    }

    for (const row of rows.slice(1)) {
      if (this.isPreviewRowEmpty(row)) {
        break;
      }

      const value = row?.[column];
      if (!this.isEmptySampleValue(value)) {
        return value;
      }
    }

    return firstRowValue;
  }

  private isEmptySampleValue(value: unknown): boolean {
    return value == null
      || value === ''
      || (Array.isArray(value) && value.length === 0);
  }

  private isPreviewRowEmpty(row: any): boolean {
    if (row == null) {
      return true;
    }

    const values = Object.values(row);
    if (values.length === 0) {
      return true;
    }

    return values.every(value => this.isEmptySampleValue(value));
  }

  isList(data: any): boolean {
    if (!data) return false;
    return isArray(data);
  }

  openArrayDialog(data: any, column: string): void {
    this.dialog.open(ListViewComponentDialogComponent, {
      data: {list: getArrayOrString(data), name: column},
      minWidth: '200px',
    });
  }

  private upsertPreviewValidation(result: PreviewValidationResponseDTO): void {
    this.previewValidationResults.update(results => {
      const existingIndex = results.findIndex(existing => existing.column === result.column);
      if (existingIndex < 0) {
        return [...results, result];
      }

      return results.map((existing, index) => index === existingIndex ? result : existing);
    });

    this.previewValidationLoadingColumns.update(loadingColumns => {
      const updated = new Set(loadingColumns);
      if (result.checks.length === 0 && result.warnings === null) {
        updated.add(result.column);
      } else {
        updated.delete(result.column);
      }
      return updated;
    });

    this.applyPreviewValidation(this.previewValidationResults());
  }

  private applyPreviewValidation(results: PreviewValidationResponseDTO[], validationComplete = false): void {
    const validationResults = Array.isArray(results) ? results : [];
    this.previewValidationResults.set(validationResults);
    const examplesByColumn = new Map<string, ConnectorMappingValidationExample[]>();

    validationResults.forEach(columnResult => {
      const sourceElement = this.dataSource().find(element => element.column === columnResult.column);
      if (!sourceElement) return;
      const owner = sourceElement.valueMappingConfig
        ? sourceElement
        : this.findValueMappingForValueColumn(columnResult.column) ?? sourceElement;
      const checks = Array.isArray(columnResult.checks) ? columnResult.checks : [];
      const examples = checks.map(check => this.toValidationExample(columnResult.column, owner, check));
      if (validationComplete && !examplesByColumn.has(owner.column)) {
        examplesByColumn.set(owner.column, []);
      }
      examplesByColumn.set(owner.column, [
        ...(examplesByColumn.get(owner.column) ?? []),
        ...examples,
      ]);
    });

    const updated = this.dataSource().map(element => {
      const examples = examplesByColumn.get(element.column);
      if (!examples) return element;

      const validationSummary = {
        valid: examples.every(example => example.valid),
        examples,
      };
      const validation = validationSummary.valid
        ? 'Valid'
        : examples.find(example => !example.valid)?.message ?? 'Invalid';
      const valueMappingConfig = element.valueMappingConfig
        ? {...element.valueMappingConfig, validationSummary}
        : element.valueMappingConfig;

      return {
        ...element,
        validation,
        validationSummary,
        valueMappingConfig,
      };
    });

    this.dataSource.set(updated);
    this.onChangeMapping();
  }

  private clearPendingValidationState(message: string): void {
    this.dataSource.update(elements => elements.map(element =>
      element.validation === 'Sync' ? {...element, validation: message} : element
    ));
  }

  private toValidationExample(
    sourceColumn: string,
    owner: ConnectorMappingElement,
    check: PreviewValidationResponseElementDTO
  ): ConnectorMappingValidationExample {
    const target = this.findValidationTarget(owner, check.result?.schemaId);
    const isBlankValue = check.value == null || String(check.value).trim() === '';
    // A missing value is allowed only when the backend confirmed that the selected target accepts
    // it. Keep that case on the summary, but let the dialog render it differently from real values.
    const valid = check.mapped && check.validated && (check.result?.valid ?? false);
    return {
      sourceLabel: sourceColumn,
      targetLabel: target?.displayValue ?? 'Not mapped',
      targetPath: target?.value ?? '',
      value: check.value,
      schemaId: check.result?.schemaId ?? target?.schemaId,
      valid,
      missing: isBlankValue,
      message: this.getPreviewValidationMessage(check),
    };
  }

  private findValidationTarget(
    owner: ConnectorMappingElement,
    schemaId: number | undefined
  ): {displayValue: string; value: string; schemaId?: number} | undefined {
    if (owner.mappingConfig && (schemaId == null || owner.mappingConfig.schemaId === schemaId)) {
      return owner.mappingConfig;
    }
    return owner.valueMappingConfig?.valueMappings.find(target =>
      schemaId == null || target.schemaId === schemaId
    );
  }

  private getPreviewValidationMessage(check: PreviewValidationResponseElementDTO): string {
    if (!check.mapped) return 'Value is not mapped';
    if (!check.validated) return 'Value was not validated';
    return check.result?.message ?? 'Validation result unavailable';
  }

  private buildCurrentSchemaMapping(): ConnectorMappingDTO[] {
    const mappings: ConnectorMappingDTO[] = [];
    this.dataSource().forEach(element => {
      if (element.mappingConfig) {
        mappings.push({
          column: element.column,
          mapping: element.mappingConfig.value,
          schemaId: element.mappingConfig.schemaId,
          visitIdMapping: element.visitIdMapping ?? undefined,
          visitTimestampMapping: element.visitTimestampMapping ?? undefined,
          timestampFormat: element.visitTimestampFormat ?? undefined,
        });
        return;
      }
      if (element.valueMappingConfig) {
        mappings.push({
          column: element.column,
          visitIdMapping: element.visitIdMapping ?? undefined,
          visitTimestampMapping: element.visitTimestampMapping ?? undefined,
          timestampFormat: element.visitTimestampFormat ?? undefined,
          valueMappingConfig: {
            ...element.valueMappingConfig,
            valueMappings: element.valueMappingConfig.valueMappings.map(target => ({...target})),
          },
        });
      }
    });
    return mappings;
  }

  private normalizeValue(value: string | null | undefined): string {
    return (value ?? '')
      .toLowerCase()
      .replace(/[_\-\s]+/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  getColumnWarnings(element: ConnectorMappingElement): PreviewValidationWarningDTO[] {
    return this.previewValidationResults()
      .find(result => result.column === element.column)
      ?.warnings ?? [];
  }

  getColumnWarningText(element: ConnectorMappingElement): string {
    return this.getColumnWarnings(element).map(warning => warning.message).join('\n');
  }

  getValidValidationIcon(element: ConnectorMappingElement): 'verified' | 'warning' {
    return this.getColumnWarnings(element).length > 0 ? 'warning' : 'verified';
  }

  isElementMapped(element: ConnectorMappingElement): boolean {
    return !!element.mappingConfig
      || !!element.valueMappingConfig
      || !!this.findValueMappingForValueColumn(element.column);
  }

  getMappingSummary(element: ConnectorMappingElement): string {
    if (element.mappingConfig) {
      return element.mappingConfig.displayValue;
    }

    if (element.valueMappingConfig) {
      const config = element.valueMappingConfig;
      const mapped = config.valueMappings.length;
      if (config.mode === ConnectorMappingMode.ONE_HOT) {
        return `${mapped} value${mapped === 1 ? '' : 's'} mapped`;
      }
      return `${mapped} value${mapped === 1 ? '' : 's'} route ${config.valueColumn}`;
    }

    const linked = this.findValueMappingForValueColumn(element.column)?.valueMappingConfig;
    return linked ? `Routed by ${linked.mappingColumn}` : 'Mapping';
  }

  getMappingType(element: ConnectorMappingElement): 'Direct' | 'Value key' | 'One-hot' | 'Value source' | undefined {
    if (element.mappingConfig) return 'Direct';
    if (element.valueMappingConfig?.mode === ConnectorMappingMode.VALUE_COLUMN) return 'Value key';
    if (element.valueMappingConfig?.mode === ConnectorMappingMode.ONE_HOT) return 'One-hot';
    if (this.findValueMappingForValueColumn(element.column)) return 'Value source';
    return undefined;
  }

  getValidationState(element: ConnectorMappingElement): 'SYNC' | 'VALID' | 'WARNING' | undefined {
    if (element.disabled) return undefined;
    if (this.previewValidationLoadingColumns().has(element.column)) return 'SYNC';
    if (!this.isElementMapped(element)) return 'WARNING';
    const validationOwner = element.valueMappingConfig
      ? element
      : this.findValueMappingForValueColumn(element.column) ?? element;
    if (validationOwner.validation === 'Sync') return 'SYNC';
    return validationOwner.validation === 'Valid' ? 'VALID' : 'WARNING';
  }

  getValidationSummary(element: ConnectorMappingElement) {
    return element.validationSummary
      ?? this.findValueMappingForValueColumn(element.column)?.validationSummary;
  }

  getValidationMessage(element: ConnectorMappingElement): string {
    return element.validation
      || this.findValueMappingForValueColumn(element.column)?.validation
      || '';
  }

  private findValueMappingForValueColumn(column: string): ConnectorMappingElement | undefined {
    return this.dataSource().find(row =>
      row.valueMappingConfig?.mode === ConnectorMappingMode.VALUE_COLUMN
      && row.valueMappingConfig.valueColumn === column
    );
  }

  private applyMappingResult(sourceColumn: string, result: ConnectorSelectMapperResult): void {
    const rows = this.dataSource();
    const sourceElement = rows.find(row => row.column === sourceColumn);
    if (!sourceElement) return;

    rows.forEach(row => {
      if (row.valueMappingConfig?.valueColumn === sourceColumn || row.column === sourceColumn) {
        row.valueMappingConfig = undefined;
        row.validationSummary = undefined;
        if (!row.mappingConfig) row.mapping = 'Mapping';
      }
    });
    sourceElement.mappingConfig = undefined;
    sourceElement.validationSummary = undefined;
    sourceElement.mapping = 'Mapping';
    sourceElement.validation = '';

    if (result.mode === ConnectorMappingMode.DIRECT) {
      if (result.value) {
        sourceElement.mappingConfig = {
          displayValue: result.displayValue,
          value: result.value,
          schemaId: result.schemaId,
        };
        sourceElement.mapping = result.displayValue;
        sourceElement.validationSummary = result.validationSummary;
        if (result.validationSummary) {
          this.applyValidationSummary(sourceElement, result.validationSummary);
        } else {
          sourceElement.validation = '';
        }
      }
      return;
    }

    const valueMappingConfig = result.valueMappingConfig;
    if (!valueMappingConfig) return;
    const owner = rows.find(row => row.column === valueMappingConfig.mappingColumn);
    if (!owner) return;
    owner.mappingConfig = undefined;
    owner.valueMappingConfig = structuredClone(valueMappingConfig);
    owner.validationSummary = result.validationSummary;
    owner.mapping = this.getMappingSummary(owner);
    if (result.validationSummary) this.applyValidationSummary(owner, result.validationSummary);
    sourceElement.mapping = `Routed by ${valueMappingConfig.mappingColumn}`;
  }

  private applyValidationSummary(
    element: ConnectorMappingElement,
    summary: NonNullable<ConnectorMappingElement['validationSummary']>
  ): void {
    element.validation = summary.valid
      ? 'Valid'
      : summary.examples.find(example => !example.valid)?.message ?? 'Invalid';
  }
}

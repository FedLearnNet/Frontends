import {Component, effect, inject, OnInit, Signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef,} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {TranslatePipe} from '@ngx-translate/core';

import {CohortDetailDto} from '@local-app/cohort/models';
import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from '@local-app/cohort/dto/schema';
import {DynamicFormService} from '@local-app/cohort/services/dynamic-form.service';
import {
  ConnectorMappingMode,
  ConnectorMappingValidationExample,
  ConnectorMappingValidationSummary,
  ConnectorValueMappingConfig,
  ConnectorValueTarget,
} from '../../../../../models/connector-value-mapping';
import {ConnectorPreviewService} from '../../../../../services/connector-preview.service';
import {
  ConnectorValidationBulkRequestDTO,
  PreviewValidationResponseDTO
} from '../../../../../dto/connector-validation';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {SelectBtnComponent} from '@shared-lib/components/select-btn/select-btn.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {getSchemaFormName} from '@shared-lib/utils';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";

interface Option {
  value: string;
  viewValue: string;
  schemaId?: number;
  node: SchemaNodeNestedDto;
  path: string[];
}

interface SourceValueOption {
  value: string;
  label: string;
  occurrences?: number;
  custom?: boolean;
}

interface ValidationCandidate {
  sourceLabel: string;
  targetLabel: string;
  targetPath: string;
  value: unknown;
  schemaId?: number;
}

type ValidationStatus = 'IDLE' | 'CHECKING' | 'VALID' | 'INVALID' | 'NO_DATA';

export interface ConnectorSelectMapperComponentData {
  column: string;
  removeFieldsPath?: string[];
  value?: string;
  cohort: CohortDetailDto;
  columns?: string[];
  rows?: Record<string, unknown>[];
  previewValidation?: Signal<PreviewValidationResponseDTO[]>;
  unavailableColumns?: string[];
  valueMappingConfig?: ConnectorValueMappingConfig;
  validationSummary?: ConnectorMappingValidationSummary;
  directOnly?: boolean;
}

export interface ConnectorSelectMapperResult {
  mode: ConnectorMappingMode;
  displayValue: string;
  value: string;
  schemaId: number;
  valueMappingConfig?: ConnectorValueMappingConfig;
  validationSummary?: ConnectorMappingValidationSummary;
}

@Component({
  selector: 'app-select-mapper',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    TranslatePipe,
    BadgeComponent,
    MatOption,
    SelectBtnComponent,
    BtnComponent,
    InfoCardComponent,
    CloseableDialogTitleComponent,
  ],
  templateUrl: './select-mapper.component.html',
  styleUrl: './select-mapper.component.scss'
})
export class ConnectorSelectMapperComponent implements OnInit {
  private readonly dfs = inject(DynamicFormService);
  private readonly connectorPreviewService = inject(ConnectorPreviewService);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject<MatDialogRef<ConnectorSelectMapperComponent>>(MatDialogRef);
  readonly data = inject<ConnectorSelectMapperComponentData>(MAT_DIALOG_DATA);

  column = '';
  cohort: CohortDetailDto;
  mode = ConnectorMappingMode.DIRECT;
  mappingColumn = '';
  mappingColumnSearch = '';
  levels: number[] = [0];
  searchTexts: string[] = [];
  selectedValues: string[] = [];
  filteredOptions: Option[][] = [];
  allOptions: Option[][] = [];
  sourceValueOptions: SourceValueOption[] = [];
  valueMappings: ConnectorValueTarget[] = [];
  /** Values the user added manually (categories the sampled data does not contain). */
  customSourceValues: string[] = [];
  customValueInput = '';
  valueSearch = '';
  unmappedOnly = false;
  validationStatus: ValidationStatus = 'IDLE';
  validationSummary?: ConnectorMappingValidationSummary;
  private validationRequestId = 0;

  private readonly previewValidationEffect = effect(() => {
    this.data.previewValidation?.();
    if (this.mappingColumn) {
      this.rebuildSourceValueOptions();
    }
  });

  protected readonly SchemaNodeTypeEnum = SchemaNodeTypeEnum;
  protected readonly ConnectorMappingMode = ConnectorMappingMode;

  ngOnInit(): void {
    const existingValueMapping = this.data.valueMappingConfig;
    this.column = existingValueMapping?.valueColumn ?? this.data.column;
    this.cohort = this.data.cohort;
    this.validationSummary = existingValueMapping?.validationSummary ?? this.data.validationSummary;
    this.syncValidationStatus();
    if (this.data.removeFieldsPath) {
      this.cohort = this.removeFields(this.cohort, this.data.removeFieldsPath);
    }

    this.initializeMapperOptions(!existingValueMapping);
    if (existingValueMapping) {
      this.mode = existingValueMapping.mode;
      this.mappingColumn = existingValueMapping.mappingColumn;
      this.mappingColumnSearch = existingValueMapping.mappingColumn;
      this.valueMappings = existingValueMapping.valueMappings.map(mapping => ({...mapping}));
      // Keep previously mapped values visible even when they are not in the sampled data.
      this.customSourceValues = [...new Set(this.valueMappings
        .map(mapping => mapping.sourceValue)
        .filter((value): value is string => !!value && value.trim() !== ''))];
      this.rebuildSourceValueOptions();
    }
    if (!this.data.directOnly && this.hasCompleteMapping()) this.validateCurrentMapping();
  }

  selectMode(mode: ConnectorMappingMode): void {
    if (this.mode === mode) {
      return;
    }

    this.mode = mode;
    this.valueSearch = '';
    this.unmappedOnly = false;
    this.resetValidation();
    if (mode === ConnectorMappingMode.ONE_HOT) {
      this.mappingColumn = this.column;
      this.valueMappings = [];
      this.rebuildSourceValueOptions();
    } else if (mode === ConnectorMappingMode.VALUE_COLUMN) {
      this.mappingColumn = '';
      this.mappingColumnSearch = '';
      this.valueMappings = [];
      this.sourceValueOptions = [];
    }
  }

  getAvailableMappingColumns(): string[] {
    const unavailable = new Set(this.data.unavailableColumns ?? []);
    return (this.data.columns ?? [])
      .filter(column => column !== this.column && (!unavailable.has(column) || column === this.mappingColumn))
      .sort((left, right) => left.localeCompare(right, undefined, {numeric: true}));
  }

  getFilteredMappingColumns(): string[] {
    const search = this.mappingColumnSearch.trim().toLocaleLowerCase();
    return this.getAvailableMappingColumns().filter(column =>
      !search || column.toLocaleLowerCase().includes(search)
    );
  }

  onMappingColumnSearchChange(search: string): void {
    this.mappingColumnSearch = search;
    if (this.mappingColumn && search !== this.mappingColumn) {
      this.clearMappingColumnSelection();
    }
  }

  usesPreviewValidationValues(column: string): boolean {
    return this.getPreviewValidationValues(column).length > 0;
  }

  selectMappingColumn(column: string): void {
    this.mappingColumnSearch = column;
    if (column === this.mappingColumn) {
      return;
    }
    this.mappingColumn = column;
    this.valueMappings = [];
    this.resetValidation();
    this.rebuildSourceValueOptions();
  }

  clearMappingColumn(event?: Event): void {
    event?.stopPropagation();
    this.mappingColumnSearch = '';
    this.clearMappingColumnSelection();
  }

  getFilteredSourceValues(): SourceValueOption[] {
    const search = this.valueSearch.trim().toLocaleLowerCase();
    return this.sourceValueOptions.filter(option => {
      const matchesSearch = !search || option.label.toLocaleLowerCase().includes(search);
      return matchesSearch && (!this.unmappedOnly || !this.getValueTarget(option.value));
    });
  }

  getValueTarget(sourceValue: string): ConnectorValueTarget | undefined {
    return this.valueMappings.find(mapping => mapping.sourceValue === sourceValue);
  }

  getMappedValueCount(): number {
    return this.sourceValueOptions.filter(option => !!this.getValueTarget(option.value)).length;
  }

  openValueTarget(option: SourceValueOption): void {
    const current = this.getValueTarget(option.value);
    const otherValuePaths = this.valueMappings
      .filter(mapping => mapping.sourceValue !== option.value)
      .map(mapping => mapping.value);
    const dialogRef = this.dialog.open(ConnectorSelectMapperComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      minWidth: '980px',
      minHeight: '40vh',
      height: '80vh',
      width: '90vw',
      autoFocus: false,
      data: {
        column: option.label,
        value: current?.value,
        cohort: structuredClone(this.cohort),
        removeFieldsPath: [...(this.data.removeFieldsPath ?? []), ...otherValuePaths],
        directOnly: true,
      } satisfies ConnectorSelectMapperComponentData,
    });

    dialogRef.afterClosed().subscribe((result?: ConnectorSelectMapperResult) => {
      if (!result) {
        return;
      }

      this.valueMappings = this.valueMappings.filter(mapping => mapping.sourceValue !== option.value);
      if (result.value) {
        this.valueMappings.push({
          sourceValue: option.value,
          displayValue: result.displayValue,
          value: result.value,
          schemaId: result.schemaId,
        });
      }
      this.validateCurrentMapping();
    });
  }

  clearValueTarget(sourceValue: string, event: Event): void {
    event.stopPropagation();
    this.valueMappings = this.valueMappings.filter(mapping => mapping.sourceValue !== sourceValue);
    this.validateCurrentMapping();
  }

  initializeFirstLevelOptions(): void {
    this.allOptions[0] = this.cohort.schemaRoot.childNodes
      .map(field => this.buildOption(field, [field.name]))
      .sort((a, b) => a.viewValue.localeCompare(b.viewValue));
    this.filteredOptions[0] = this.allOptions[0];
  }

  initializeValues(): void {
    if (this.data.value) {
      const values = this.data.value.split('.');
      for (let i = 0; i < values.length; i++) {
        this.searchTexts[i] = values[i];
        this.selectedValues[i] = values[i];
        this.updateFilteredOptions(i);
        if (i < values.length - 1) {
          this.loadNextLevelOptions(i, values[i]);
        }
      }
      this.syncSearchTextsFromSelection();
    }
  }

  loadNextLevelOptions(level: number, selectedValue: string): void {
    this.clearAfterLevel(level);
    const currentField = this.getFieldByValue(level, selectedValue);
    if (currentField && this.dfs.isNodeGroup(currentField) && this.levels.indexOf(level + 1) === -1) {
      this.levels.push(level + 1);
      this.searchTexts.push('');
      this.selectedValues.push('');
      this.allOptions[level + 1] = currentField.childNodes
        .map(field => this.buildOption(field, [...this.selectedValues.slice(0, level + 1), field.name]))
        .sort((a, b) => a.viewValue.localeCompare(b.viewValue));
      this.filteredOptions[level + 1] = this.allOptions[level + 1];
      this.updateFilteredOptions(level + 1);
    }
  }

  getFieldByValue(level: number, value: string): SchemaNodeNestedDto | undefined {
    let fields = this.cohort.schemaRoot.childNodes;
    let foundField;
    for (let i = 0; i <= level; i++) {
      const field = fields.find(f => f.name === (this.selectedValues[i] || value));
      if (field && field.childNodes.length > 0) {
        fields = field.childNodes;
        foundField = field;
      } else {
        return field;
      }
    }
    return foundField;
  }

  getSelectedNode(): SchemaNodeNestedDto | undefined {
    const deepestLevel = this.getDeepestSelectedLevel();
    return deepestLevel < 0
      ? undefined
      : this.getFieldByValue(deepestLevel, this.selectedValues[deepestLevel]);
  }

  isGroupNode(node: SchemaNodeNestedDto): boolean {
    return this.dfs.isNodeGroup(node);
  }

  isMappingTarget(node: SchemaNodeNestedDto): boolean {
    return !this.isGroupNode(node);
  }

  getNodeIcon(node: SchemaNodeNestedDto): string {
    if (this.isGroupNode(node)) return 'folder';
    if (node.nodeType === SchemaNodeTypeEnum.LIST_ATTRIBUTE) return 'format_list_bulleted';
    return 'description';
  }

  updateFilteredOptions(level: number): void {
    if (this.searchTexts[level]) {
      const filterValue = this.searchTexts[level].toLowerCase();
      this.filteredOptions[level] = this.getSearchOptions(level)
        .filter(option => this.matchesOption(option, filterValue));
    } else {
      this.filteredOptions[level] = this.allOptions[level];
    }
  }

  clearFilteredOptions(level: number): void {
    this.selectedValues[level] = '';
    this.searchTexts[level] = '';
    this.filteredOptions[level] = this.allOptions[level];
    this.clearAfterLevel(level);
    this.validateCurrentMapping();
  }

  onSelection(selectionValue: string): void {
    const path = this.parseOptionSelectionPath(selectionValue)
      ?? this.findNodePath(this.cohort.schemaRoot.childNodes, Number(selectionValue));
    if (!path) return;

    this.selectOptionPath(path);
    this.validateCurrentMapping();
  }

  getOptionSelectionValue(option: Option): string {
    return JSON.stringify(option.path);
  }

  isChildSearchResult(level: number, option: Option): boolean {
    return !!this.searchTexts[level]?.trim() && option.path.length > level + 1;
  }

  getOptionPathLabel(option: Option): string {
    return option.path.join(' > ');
  }

  isApplyEnabled(): boolean {
    if (this.mode === ConnectorMappingMode.DIRECT) {
      if (this.selectedValues.every(value => !value)) return true;
      const node = this.getSelectedNode();
      return !!node && this.isMappingTarget(node) && this.validationStatus !== 'CHECKING';
    }
    const mappingColumnSelected = this.mode === ConnectorMappingMode.ONE_HOT || !!this.mappingColumn;
    return mappingColumnSelected && this.valueMappings.length > 0 && this.validationStatus !== 'CHECKING';
  }

  clear(): void {
    this.mode = ConnectorMappingMode.DIRECT;
    this.mappingColumn = '';
    this.mappingColumnSearch = '';
    this.sourceValueOptions = [];
    this.valueMappings = [];
    this.searchTexts = [];
    this.selectedValues = [];
    this.resetValidation();
    this.initializeMapperOptions(false);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  clearAfterLevel(level: number): void {
    this.searchTexts = this.searchTexts.slice(0, level + 1);
    this.filteredOptions = this.filteredOptions.slice(0, level + 1);
    this.selectedValues = this.selectedValues.slice(0, level + 1);
    this.levels = this.levels.slice(0, level + 1);
  }

  removeNestedField(fieldStructure: SchemaNodeNestedDto[], path: string[]): SchemaNodeNestedDto[] {
    if (path.length === 0) return fieldStructure;
    const [current, ...rest] = path;
    return fieldStructure.reduce((acc, field) => {
      if (field.name !== current) {
        acc.push(field);
      } else if (rest.length > 0 && field.childNodes) {
        field.childNodes = this.removeNestedField(field.childNodes, rest);
        acc.push(field);
      }
      return acc;
    }, [] as SchemaNodeNestedDto[]);
  }

  removeEmptyGroups(fieldStructure: SchemaNodeNestedDto[]): SchemaNodeNestedDto[] {
    return fieldStructure.reduce((acc, field) => {
      if (field.nodeType !== SchemaNodeTypeEnum.GROUP || field.childNodes?.length) {
        if (field.childNodes?.length) field.childNodes = this.removeEmptyGroups(field.childNodes);
        acc.push(field);
      }
      return acc;
    }, [] as SchemaNodeNestedDto[]);
  }

  removeFields(cohort: CohortDetailDto, fieldsToRemove: string[]): CohortDetailDto {
    fieldsToRemove.forEach(fieldPath => {
      if (!fieldPath || fieldPath === this.data.value) return;
      cohort.schemaRoot.childNodes = this.removeNestedField(cohort.schemaRoot.childNodes, fieldPath.split('.'));
    });
    cohort.schemaRoot.childNodes = this.removeEmptyGroups(cohort.schemaRoot.childNodes);
    return cohort;
  }

  apply(): void {
    if (this.mode === ConnectorMappingMode.DIRECT) {
      this.dialogRef.close({
        mode: ConnectorMappingMode.DIRECT,
        displayValue: this.selectedValues.join(' > '),
        value: this.selectedValues.join('.'),
        schemaId: this.getLatestSelectedSchemaId(),
        validationSummary: this.validationSummary,
      } satisfies ConnectorSelectMapperResult);
      return;
    }

    const valueMappingConfig: ConnectorValueMappingConfig = {
      mode: this.mode,
      mappingColumn: this.mode === ConnectorMappingMode.ONE_HOT ? this.column : this.mappingColumn,
      valueColumn: this.column,
      valueMappings: this.sourceValueOptions
        .map(option => this.getValueTarget(option.value))
        .filter((mapping): mapping is ConnectorValueTarget => !!mapping),
      validationSummary: this.validationSummary,
    };
    this.dialogRef.close({
      mode: this.mode,
      displayValue: '',
      value: '',
      schemaId: 0,
      valueMappingConfig,
      validationSummary: this.validationSummary,
    } satisfies ConnectorSelectMapperResult);
  }

  validateCurrentMapping(): void {
    if (this.data.directOnly || !this.hasCompleteMapping()) {
      this.resetValidation();
      return;
    }

    const candidates = this.buildValidationCandidates();
    if (!candidates.length) {
      this.validationRequestId++;
      this.validationSummary = undefined;
      this.validationStatus = 'NO_DATA';
      return;
    }

    const requestId = ++this.validationRequestId;
    this.validationStatus = 'CHECKING';
    this.validationSummary = undefined;
    const candidateGroups = new Map<string, ValidationCandidate[]>();
    candidates.forEach(candidate => {
      const groupKey = `${candidate.schemaId ?? 'external'}:${candidate.targetPath}`;
      const group = candidateGroups.get(groupKey) ?? [];
      group.push(candidate);
      candidateGroups.set(groupKey, group);
    });
    const orderedCandidates = [...candidateGroups.values()].flat();
    const payload: ConnectorValidationBulkRequestDTO[] = [...candidateGroups.values()]
      .map(examples => ({
        schemaId: examples[0].schemaId,
        mapping: examples[0].targetPath,
        values: examples.map(example => example.value),
      }));

    this.connectorPreviewService.bulkTestValue(this.cohort.id, payload).subscribe(results => {
      if (requestId !== this.validationRequestId) return;
      const validationResults = Array.isArray(results) ? results : [];

      const examples: ConnectorMappingValidationExample[] = orderedCandidates.map((candidate, index) => {
        const result = validationResults[index];
        return {
          ...candidate,
          valid: result?.valid ?? false,
          missing: this.isBlankValue(candidate.value),
          message: result?.message ?? 'Validation result unavailable',
        };
      });
      const valid = examples.every(example => example.valid);
      this.validationSummary = {valid, examples};
      this.validationStatus = valid ? 'VALID' : 'INVALID';
    });
  }

  formatValidationValue(value: unknown): string {
    if (value == null || value === '') return 'Blank value';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  isBlankValue(value: unknown): boolean {
    return value == null || String(value).trim() === '';
  }

  hasCompleteMapping(): boolean {
    if (this.mode === ConnectorMappingMode.DIRECT) {
      const node = this.getSelectedNode();
      return !!node && this.isMappingTarget(node);
    }
    return !!this.mappingColumn && this.valueMappings.length > 0;
  }

  private buildValidationCandidates(): ValidationCandidate[] {
    if (this.mode === ConnectorMappingMode.DIRECT) {
      const schemaId = this.getLatestSelectedSchemaId();
      const targetLabel = this.selectedValues.join(' > ');
      return this.sampleValues(this.getColumnValues(this.column)).map(value => ({
        sourceLabel: this.column,
        targetLabel,
        targetPath: this.selectedValues.join('.'),
        value,
        schemaId,
      }));
    }

    if (this.mode === ConnectorMappingMode.ONE_HOT) {
      return this.valueMappings.map(mapping => ({
        sourceLabel: `${this.column} = ${mapping.sourceValue || 'Blank value'}`,
        targetLabel: mapping.displayValue,
        targetPath: mapping.value,
        value: true,
        schemaId: mapping.schemaId,
      }));
    }

    return this.valueMappings.flatMap(mapping => {
      const validationValues = this.getPreviewValidationValues(this.column);
      const values = validationValues.length
        ? validationValues
        : (this.data.rows ?? [])
          .filter(row => this.flattenValue(row?.[this.mappingColumn])
            .some(value => this.normalizeSourceValue(value) === mapping.sourceValue))
          .flatMap(row => this.flattenValue(row?.[this.column]));
      return this.sampleValues(values).map(value => ({
        sourceLabel: `${this.mappingColumn} = ${mapping.sourceValue || 'Blank value'}`,
        targetLabel: mapping.displayValue,
        targetPath: mapping.value,
        value,
        schemaId: mapping.schemaId,
      }));
    });
  }

  private getColumnValues(column: string): unknown[] {
    const validationValues = this.getPreviewValidationValues(column);
    if (validationValues.length) return validationValues;
    return (this.data.rows ?? []).flatMap(row => this.flattenValue(row?.[column]));
  }

  private getPreviewValidationValues(column: string): string[] {
    const checks = this.data.previewValidation?.()
      .find(result => result.column === column)
      ?.checks ?? [];
    // Blank/empty values are not a category of their own.
    return [...new Set(checks
      .map(check => this.normalizeSourceValue(check.value))
      .filter(value => value.trim() !== ''))];
  }

  private flattenValue(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [value];
  }

  private sampleValues(values: unknown[]): unknown[] {
    const unique = new Map<string, unknown>();
    values.forEach(value => {
      const key = this.normalizeSourceValue(value);
      if (!unique.has(key)) unique.set(key, value);
    });
    const distinct = [...unique.values()];
    const allIntegers = distinct.length > 0 && distinct.every(value => this.isIntegerValue(value));
    if (!allIntegers || distinct.length <= 5) return distinct;

    const sorted = [...distinct].sort((left, right) => Number(left) - Number(right));
    const last = sorted.length - 1;
    return [...new Set([0, Math.round(last * 0.25), Math.round(last * 0.5), Math.round(last * 0.75), last])]
      .map(index => sorted[index]);
  }

  private isIntegerValue(value: unknown): boolean {
    if (typeof value === 'number') return Number.isInteger(value);
    return typeof value === 'string' && /^[-+]?\d+$/.test(value.trim());
  }

  private resetValidation(): void {
    this.validationRequestId++;
    this.validationSummary = undefined;
    this.validationStatus = 'IDLE';
  }

  private clearMappingColumnSelection(): void {
    if (!this.mappingColumn && this.valueMappings.length === 0) return;
    this.mappingColumn = '';
    this.valueMappings = [];
    this.sourceValueOptions = [];
    this.resetValidation();
  }

  private syncValidationStatus(): void {
    if (!this.validationSummary) {
      this.validationStatus = 'IDLE';
      return;
    }
    this.validationStatus = this.validationSummary.valid ? 'VALID' : 'INVALID';
  }

  private rebuildSourceValueOptions(): void {
    if (!this.mappingColumn) {
      this.sourceValueOptions = [];
      return;
    }

    const validationValues = this.getPreviewValidationValues(this.mappingColumn);
    if (validationValues.length) {
      this.sourceValueOptions = this.withCustomValues(validationValues
        .map(value => ({value, label: value})));
      return;
    }

    const counts = new Map<string, number>();
    for (const row of this.data.rows ?? []) {
      const rawValue = row?.[this.mappingColumn];
      const values = Array.isArray(rawValue) ? rawValue : [rawValue];
      for (const value of values) {
        const normalized = this.normalizeSourceValue(value);
        // Blank/empty values are not a category of their own.
        if (normalized.trim() === '') continue;
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      }
    }
    this.sourceValueOptions = this.withCustomValues([...counts.entries()]
      .map(([value, occurrences]) => ({value, label: value, occurrences})));
  }

  /** Appends manually added custom values (that are not already present) and sorts the list. */
  private withCustomValues(options: SourceValueOption[]): SourceValueOption[] {
    const existing = new Set(options.map(option => option.value));
    const merged = [...options];
    for (const value of this.customSourceValues) {
      if (!existing.has(value)) {
        merged.push({value, label: value, custom: true});
        existing.add(value);
      }
    }
    return merged.sort((a, b) => a.label.localeCompare(b.label, undefined, {numeric: true}));
  }

  addCustomSourceValue(): void {
    const value = this.normalizeSourceValue(this.customValueInput).trim();
    if (!value || this.customSourceValues.includes(value)) {
      this.customValueInput = '';
      return;
    }
    this.customSourceValues = [...this.customSourceValues, value];
    this.customValueInput = '';
    this.rebuildSourceValueOptions();
  }

  removeCustomSourceValue(value: string, event?: Event): void {
    event?.stopPropagation();
    this.customSourceValues = this.customSourceValues.filter(current => current !== value);
    this.valueMappings = this.valueMappings.filter(mapping => mapping.sourceValue !== value);
    this.rebuildSourceValueOptions();
  }

  private normalizeSourceValue(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value).trim();
  }

  private getLatestSelectedSchemaId(): number {
    for (let level = this.selectedValues.length - 1; level >= 0; level--) {
      const selectedValue = this.selectedValues[level];
      const selectedOption = this.allOptions[level]?.find(option => option.value === selectedValue);
      if (selectedOption?.schemaId != null) return selectedOption.schemaId;
    }
    return 0;
  }

  private initializeMapperOptions(initializeValues = true): void {
    this.levels = [0];
    this.initializeFirstLevelOptions();
    if (initializeValues) this.initializeValues();
  }

  private buildOption(node: SchemaNodeNestedDto, path: string[]): Option {
    return {
      value: node.name,
      viewValue: path.length > 1 && node.dataType?.name ? getSchemaFormName(node.name, node.dataType.name) : node.name,
      schemaId: node.id,
      node,
      path,
    };
  }

  private parseOptionSelectionPath(selectionValue: string): string[] | undefined {
    try {
      const path: unknown = JSON.parse(selectionValue);
      return Array.isArray(path) && path.every(value => typeof value === 'string')
        ? path
        : undefined;
    } catch {
      return undefined;
    }
  }

  private matchesOption(option: Option, filterValue: string): boolean {
    return [
      option.viewValue,
      option.node.name,
      option.node.description,
      option.node.ontology?.name,
      option.node.ontology?.description,
      option.node.dataType?.name,
      option.node.dataType?.description,
      option.node.dataType?.type,
      option.path.join(' '),
    ]
      .filter(part => !!part?.trim())
      .join(' ')
      .toLowerCase()
      .includes(filterValue);
  }

  private getSearchOptions(level: number): Option[] {
    const parentPath = this.selectedValues.slice(0, level);
    const nodes = level === 0
      ? this.cohort.schemaRoot.childNodes
      : this.getFieldByValue(level - 1, this.selectedValues[level - 1])?.childNodes ?? [];

    return this.flattenOptions(nodes, parentPath)
      .sort((a, b) => this.getOptionPathLabel(a).localeCompare(this.getOptionPathLabel(b)));
  }

  private flattenOptions(nodes: SchemaNodeNestedDto[], parentPath: string[]): Option[] {
    return nodes.flatMap(node => {
      const path = [...parentPath, node.name];
      return [
        this.buildOption(node, path),
        ...this.flattenOptions(node.childNodes ?? [], path),
      ];
    });
  }

  private findNodePath(nodes: SchemaNodeNestedDto[], schemaId: number, parentPath: string[] = []): string[] | undefined {
    for (const node of nodes) {
      const path = [...parentPath, node.name];
      if (node.id === schemaId) return path;
      const childPath = this.findNodePath(node.childNodes ?? [], schemaId, path);
      if (childPath) return childPath;
    }
    return undefined;
  }

  private selectOptionPath(path: string[]): void {
    this.levels = [0];
    this.searchTexts = [''];
    this.selectedValues = [''];
    this.filteredOptions = [];
    this.allOptions = [];
    this.initializeFirstLevelOptions();

    path.forEach((value, level) => {
      const option = this.allOptions[level]?.find(item => item.value === value);
      if (!option) return;

      this.selectedValues[level] = value;
      this.searchTexts[level] = option.viewValue;
      if (this.isGroupNode(option.node)) {
        this.levels.push(level + 1);
        this.searchTexts[level + 1] = '';
        this.selectedValues[level + 1] = '';
        this.allOptions[level + 1] = option.node.childNodes
          .map(child => this.buildOption(child, [...path.slice(0, level + 1), child.name]))
          .sort((a, b) => a.viewValue.localeCompare(b.viewValue));
        this.filteredOptions[level + 1] = this.allOptions[level + 1];
      }
    });
  }

  private getDeepestSelectedLevel(): number {
    for (let level = this.selectedValues.length - 1; level >= 0; level--) {
      if (this.selectedValues[level]) return level;
    }
    return -1;
  }

  private syncSearchTextsFromSelection(): void {
    this.selectedValues.forEach((value, level) => {
      const option = this.allOptions[level]?.find(item => item.value === value);
      if (option) this.searchTexts[level] = option.viewValue;
    });
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}

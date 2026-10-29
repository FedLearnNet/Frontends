import {ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {FormBuilder, FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {QueryConfig} from '@global-app/find-data/models';
import {DataTypes} from '@global-app/schema/dto/datatype';
import {describeQueryLeaf, formatInterval} from '@global-app/find-data/helpers/query-tree.serializer';
import {
  operatorHasValue,
  operatorMenuLabel,
  patchLeaf,
  timeAggregationChoices,
  valueAggregationChoices,
  valueModeChoices,
} from '@global-app/find-data/helpers/query-tree.rules';
import {
  DatatypeHintValue,
  IntervalPart,
  QueryLeafNode,
  TimeAggregation,
  TimeFilterChoice,
  ValueMode,
} from '@global-app/find-data/models/query-tree';
import {QueryIntervalFieldComponent} from '@global-app/find-data/components/query-interval-field/query-interval-field.component';

type ValueModeChoice = 'absolute' | 'delta' | 'delta_window';
type TimeButton = 'None' | 'first' | 'last' | 'within';

interface LeafFormValue {
  operator: QueryOperatorTypes | '';
  value: string;
  datatypeHint: DatatypeHintValue;
  valueMode: ValueMode;
  timeFilterMode: TimeFilterChoice;
  timeAfter: string;
  timeBefore: string;
  timeAggregation: TimeAggregation;
  timeWindowCount: number | null;
  valueAggregation: 'None' | 'average';
  atLeast: number | null;
  atMost: number | null;
}

@Component({
  selector: 'app-query-builder-item',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    TranslatePipe,
    QueryIntervalFieldComponent,
  ],
  templateUrl: './query-builder-item.component.html',
  styleUrl: './query-builder-item.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class QueryBuilderItemComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly leaf = input.required<QueryLeafNode>();
  readonly index = input(0);
  readonly indexLabel = input('');
  readonly queryConfigs = input<QueryConfig[]>([]);
  readonly isFirst = input(false);
  readonly isLast = input(false);

  readonly leafChange = output<QueryLeafNode>();
  readonly remove = output<void>();
  readonly duplicate = output<void>();
  readonly moveUp = output<void>();
  readonly moveDown = output<void>();

  readonly advancedOpen = signal(false);
  readonly catalogControl = new FormControl('', {nonNullable: true});
  readonly catalogQuery = signal('');
  readonly datatypeHints: DatatypeHintValue[] = ['String', 'Integer', 'Float', 'Boolean'];
  readonly timeFilterModes: TimeFilterChoice[] = ['anytime', 'after', 'before', 'between'];

  readonly form = this.formBuilder.nonNullable.group({
    operator: this.formBuilder.nonNullable.control<QueryOperatorTypes | ''>(''),
    value: '',
    datatypeHint: this.formBuilder.nonNullable.control<DatatypeHintValue>(''),
    valueMode: this.formBuilder.nonNullable.control<ValueMode>('absolute'),
    timeFilterMode: this.formBuilder.nonNullable.control<TimeFilterChoice>('anytime'),
    timeAfter: '',
    timeBefore: '',
    timeAggregation: this.formBuilder.nonNullable.control<TimeAggregation>('None'),
    timeWindowCount: this.formBuilder.control<number | null>(null),
    valueAggregation: this.formBuilder.nonNullable.control<'None' | 'average'>('None'),
    atLeast: this.formBuilder.control<number | null>(null),
    atMost: this.formBuilder.control<number | null>(null),
  });

  readonly selectedConfig = computed(() => {
    const leaf = this.leaf();
    return this.queryConfigs().find(config =>
      config.ontology.id === leaf.ontologyId && config.dataType.id === leaf.dataTypeId
    );
  });

  readonly badgeLabel = computed(() => this.indexLabel() || `${this.index() + 1}`);
  readonly fieldId = computed(() => `qb-${this.leaf().id}`);
  readonly dataTypeText = computed(() => {
    const config = this.selectedConfig();
    if (!config) {
      return '';
    }
    const label = config.dataType.label || config.dataType.name || config.dataType.id || '';
    return config.dataType.type && config.dataType.type !== label ? `${label} (${config.dataType.type})` : label;
  });
  readonly summary = computed(() => {
    const leaf = this.leaf();
    if (!leaf.ontologyId && !leaf.catalogName) {
      return '';
    }
    return describeQueryLeaf(leaf, item => this.selectedConfig()?.name || item.catalogName || item.ontologyId);
  });

  readonly filteredColumns = computed(() => {
    const filter = this.catalogQuery().toLowerCase();
    return this.queryConfigs()
      .map(config => ({
        label: `${config.name} (${config.label})`,
        value: config.name,
      }))
      .filter(option => option.label.toLowerCase().includes(filter));
  });

  readonly operatorOptions = computed(() => {
    const options = (this.selectedConfig()?.queryOperatorOption?.options ?? [])
      .map(option => ({value: option.value, label: operatorMenuLabel(option.value, option.label)}));
    const operator = this.leaf().operator;
    if (operator && !options.some(option => option.value === operator)) {
      return [{label: operatorMenuLabel(operator, operator), value: operator}, ...options];
    }
    return options;
  });

  readonly valueKind = computed(() => {
    const operator = this.leaf().operator;
    if (!operatorHasValue(operator)) {
      return 'hidden';
    }
    if (operator === QueryOperatorTypes.IN || operator === QueryOperatorTypes.NOT_IN) {
      return 'list';
    }
    const config = this.selectedConfig();
    if (config?.dataType.type === DataTypes.BOOLEAN) {
      return 'boolean';
    }
    if (config?.dataType.type === DataTypes.CATEGORICAL
      && (config.options?.length ?? 0) > 0
      && (operator === QueryOperatorTypes.EQUAL || operator === QueryOperatorTypes.NOT_EQUAL)) {
      return 'options';
    }
    return 'text';
  });

  readonly valueModes = computed(() => valueModeChoices(this.leaf()));
  readonly valueAggregations = computed(() => valueAggregationChoices(this.leaf()));
  readonly timeAggregations = computed(() => timeAggregationChoices(this.leaf()));
  readonly valueModeButtons = computed((): ValueModeChoice[] => {
    const modes = this.valueModes();
    const buttons: ValueModeChoice[] = [];
    if (modes.includes('absolute')) {
      buttons.push('absolute');
    }
    if (modes.includes('delta')) {
      buttons.push('delta', 'delta_window');
    }
    return buttons;
  });
  readonly valueModeChoice = computed((): ValueModeChoice => {
    const leaf = this.leaf();
    if (leaf.valueMode !== 'delta') {
      return 'absolute';
    }
    return leaf.deltaWindow ? 'delta_window' : 'delta';
  });
  readonly timeButtons = computed((): TimeButton[] => {
    const choices = this.timeAggregations();
    const buttons: TimeButton[] = [];
    if (choices.includes('None')) {
      buttons.push('None');
    }
    if (choices.includes('first')) {
      buttons.push('first');
    }
    if (choices.includes('last')) {
      buttons.push('last');
    }
    if (choices.some(choice => choice.startsWith('within'))) {
      buttons.push('within');
    }
    return buttons;
  });
  readonly showDeltaInterval = computed(() => this.leaf().valueMode === 'delta' && this.leaf().deltaWindow);
  readonly deltaText = computed(() => {
    if (this.leaf().valueMode !== 'delta') {
      return '';
    }
    const interval = formatInterval(this.leaf().deltaInterval);
    return interval ? `delta ${interval}` : 'delta';
  });
  readonly windowText = computed(() => {
    const leaf = this.leaf();
    if (leaf.timeAggregation === 'None' || leaf.timeAggregation === 'first' || leaf.timeAggregation === 'last') {
      return '';
    }
    const interval = formatInterval(leaf.timeWindow);
    const span = interval ? `within ${interval}` : 'within';
    if (leaf.timeAggregation === 'within_at_least') {
      return `${span} at least ${leaf.timeWindowCount ?? ''} times`.replace('  ', ' ').trim();
    }
    if (leaf.timeAggregation === 'within_at_most') {
      return `${span} at most ${leaf.timeWindowCount ?? ''} times`.replace('  ', ' ').trim();
    }
    return span;
  });
  readonly showTimeWindow = computed(() =>
    this.leaf().timeAggregation === 'within'
    || this.leaf().timeAggregation === 'within_at_least'
    || this.leaf().timeAggregation === 'within_at_most'
  );
  readonly showTimeCount = computed(() =>
    this.leaf().timeAggregation === 'within_at_least' || this.leaf().timeAggregation === 'within_at_most'
  );

  readonly displayColumnName = (value: string | null): string => {
    if (!value) {
      return '';
    }
    const config = this.queryConfigs().find(item => item.name === value);
    return config ? `${config.name} (${config.label})` : value;
  };

  private formSnapshot: LeafFormValue | null = null;
  private lastEmitted = '';
  private syncing = false;
  private advancedLeafId = '';

  constructor() {
    effect(() => {
      const leaf = this.leaf();
      if (leaf.id !== this.advancedLeafId) {
        this.advancedLeafId = leaf.id;
        this.advancedOpen.set(leafUsesAdvancedFilters(leaf));
      }
      const serialized = JSON.stringify(leaf);
      if (serialized === this.lastEmitted) {
        return;
      }
      this.applyLeaf(leaf);
      this.lastEmitted = serialized;
    });

    this.form.valueChanges.subscribe(() => {
      if (this.syncing) {
        return;
      }
      const current = this.form.getRawValue();
      const patch = this.diff(this.formSnapshot, current);
      this.formSnapshot = {...current};
      if (Object.keys(patch).length === 0) {
        return;
      }
      this.emit(patchLeaf(this.leaf(), patch));
    });
  }

  onCatalogInput(value: string): void {
    this.catalogQuery.set(value);
  }

  onCatalogSelected(name: string): void {
    const config = this.queryConfigs().find(item => item.name === name);
    if (!config) {
      return;
    }
    this.emit(patchLeaf(this.leaf(), {
      catalogName: config.name,
      ontologyId: config.ontology.id ?? '',
      dataTypeId: config.dataType.id ?? '',
      catalogType: config.dataType.type,
      operator: '',
      value: '',
    }));
  }

  clearCatalog(): void {
    this.emit(patchLeaf(this.leaf(), {
      catalogName: '',
      ontologyId: '',
      dataTypeId: '',
      catalogType: '',
      operator: '',
      value: '',
    }));
  }

  valueModeKey(choice: ValueModeChoice): string {
    if (choice === 'absolute') {
      return 'QUERY_BUILDER.MODE.ABSOLUTE';
    }
    if (choice === 'delta') {
      return 'QUERY_BUILDER.MODE.DELTA';
    }
    return 'QUERY_BUILDER.MODE.DELTA_WINDOW';
  }

  timeButtonKey(method: TimeButton): string {
    if (method === 'None') {
      return 'QUERY_BUILDER.TIME.NONE';
    }
    if (method === 'first') {
      return 'QUERY_BUILDER.TIME.FIRST';
    }
    if (method === 'last') {
      return 'QUERY_BUILDER.TIME.LAST';
    }
    return 'QUERY_BUILDER.TIME.WITHIN_WINDOW';
  }

  setValueMode(choice: ValueModeChoice): void {
    if (choice === 'absolute') {
      this.emit({...patchLeaf(this.leaf(), {valueMode: 'absolute'}), deltaWindow: false, deltaInterval: []});
      return;
    }
    const next = patchLeaf(this.leaf(), {valueMode: 'delta'});
    if (choice === 'delta') {
      this.emit({...next, deltaWindow: false, deltaInterval: []});
      return;
    }
    const deltaInterval = this.leaf().deltaInterval.length
      ? this.leaf().deltaInterval
      : [{count: 1, unit: 'days' as const}];
    this.emit({...next, deltaWindow: true, deltaInterval});
  }

  setTimeFilter(mode: TimeFilterChoice): void {
    const next: QueryLeafNode = {...this.leaf(), timeFilterChoice: mode};
    if (mode === 'anytime') {
      next.timeAfter = '';
      next.timeBefore = '';
    } else if (mode === 'after') {
      next.timeBefore = '';
    } else if (mode === 'before') {
      next.timeAfter = '';
    }
    this.emit(next);
  }

  openTimeAggregation(method: TimeButton): void {
    if (method !== 'within') {
      this.setTimeShape(method);
      return;
    }
    const current = this.leaf().timeAggregation;
    if (current === 'within' || current === 'within_at_least' || current === 'within_at_most') {
      return;
    }
    const choices = timeAggregationChoices(this.leaf());
    const next = choices.includes('within')
      ? 'within'
      : choices.includes('within_at_least')
        ? 'within_at_least'
        : 'within_at_most';
    this.setTimeShape(next);
  }

  setTimeShape(method: TimeAggregation): void {
    const leaf = this.leaf();
    const needsWindow = method === 'within' || method === 'within_at_least' || method === 'within_at_most';
    const timeWindow = needsWindow
      ? (leaf.timeWindow.length ? leaf.timeWindow : [{count: 1, unit: 'weeks' as const}])
      : [];
    const timeWindowCount = method === 'within_at_least' || method === 'within_at_most'
      ? (leaf.timeWindowCount ?? 1)
      : null;
    const next = patchLeaf(leaf, {timeAggregation: method});
    this.emit({...next, timeWindow, timeWindowCount});
  }

  setValueAggregation(value: 'None' | 'average'): void {
    this.emit(patchLeaf(this.leaf(), {valueAggregation: value}));
  }

  onDeltaInterval(parts: IntervalPart[]): void {
    this.emit({...this.leaf(), deltaInterval: parts, deltaWindow: true});
  }

  onTimeWindow(parts: IntervalPart[]): void {
    this.emit({...this.leaf(), timeWindow: parts});
  }

  ontologyLabel(): string {
    const config = this.selectedConfig();
    return config?.ontology.label || config?.ontology.names?.[0] || this.leaf().ontologyId;
  }

  dataTypeLabel(): string {
    const config = this.selectedConfig();
    return config?.dataType.label || config?.dataType.name || this.leaf().dataTypeId;
  }

  private emit(next: QueryLeafNode): void {
    const serialized = JSON.stringify(next);
    this.lastEmitted = serialized;
    this.applyLeaf(next);
    if (serialized !== JSON.stringify(this.leaf())) {
      this.leafChange.emit(next);
    }
  }

  private applyLeaf(leaf: QueryLeafNode): void {
    this.syncing = true;
    const formValue = toFormValue(leaf);
    this.form.patchValue(formValue, {emitEvent: false});
    this.formSnapshot = formValue;
    if (this.catalogControl.value !== leaf.catalogName) {
      this.catalogControl.setValue(leaf.catalogName, {emitEvent: false});
    }
    this.catalogQuery.set(leaf.catalogName);
    this.syncing = false;
  }

  private diff(previous: LeafFormValue | null, current: LeafFormValue): Partial<QueryLeafNode> {
    const patch: Partial<QueryLeafNode> = {};
    if (!previous || previous.operator !== current.operator) {
      patch.operator = current.operator ?? '';
    }
    if (!previous || previous.value !== current.value) {
      patch.value = current.value ?? '';
    }
    if (!previous || previous.datatypeHint !== current.datatypeHint) {
      patch.datatypeHint = current.datatypeHint ?? '';
    }
    if (!previous || previous.valueMode !== current.valueMode) {
      patch.valueMode = current.valueMode ?? 'absolute';
    }
    if (!previous || previous.timeAggregation !== current.timeAggregation) {
      patch.timeAggregation = current.timeAggregation ?? 'None';
    }
    if (!previous || previous.valueAggregation !== current.valueAggregation) {
      patch.valueAggregation = current.valueAggregation ?? 'None';
    }
    if (!previous || optionalNumber(previous.timeWindowCount) !== optionalNumber(current.timeWindowCount)) {
      patch.timeWindowCount = optionalNumber(current.timeWindowCount);
    }
    if (!previous || optionalNumber(previous.atLeast) !== optionalNumber(current.atLeast)) {
      patch.atLeast = optionalNumber(current.atLeast);
    }
    if (!previous || optionalNumber(previous.atMost) !== optionalNumber(current.atMost)) {
      patch.atMost = optionalNumber(current.atMost);
    }

    const modeChanged = !previous || previous.timeFilterMode !== current.timeFilterMode;
    if (modeChanged) {
      patch.timeFilterChoice = current.timeFilterMode;
      if (current.timeFilterMode === 'anytime') {
        patch.timeAfter = '';
        patch.timeBefore = '';
      } else if (current.timeFilterMode === 'after') {
        patch.timeAfter = current.timeAfter ?? '';
        patch.timeBefore = '';
      } else if (current.timeFilterMode === 'before') {
        patch.timeAfter = '';
        patch.timeBefore = current.timeBefore ?? '';
      } else {
        patch.timeAfter = current.timeAfter ?? '';
        patch.timeBefore = current.timeBefore ?? '';
      }
    } else if (previous) {
      if (previous.timeAfter !== current.timeAfter) {
        patch.timeAfter = current.timeAfter ?? '';
      }
      if (previous.timeBefore !== current.timeBefore) {
        patch.timeBefore = current.timeBefore ?? '';
      }
    }

    return patch;
  }
}

function toFormValue(leaf: QueryLeafNode): LeafFormValue {
  return {
    operator: leaf.operator,
    value: leaf.value,
    datatypeHint: leaf.datatypeHint,
    valueMode: leaf.valueMode,
    timeFilterMode: leaf.timeFilterChoice,
    timeAfter: leaf.timeAfter,
    timeBefore: leaf.timeBefore,
    timeAggregation: leaf.timeAggregation,
    timeWindowCount: leaf.timeWindowCount,
    valueAggregation: leaf.valueAggregation,
    atLeast: leaf.atLeast,
    atMost: leaf.atMost,
  };
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function leafUsesAdvancedFilters(leaf: QueryLeafNode): boolean {
  return leaf.valueMode !== 'absolute'
    || leaf.deltaWindow
    || leaf.deltaInterval.length > 0
    || leaf.timeFilterChoice !== 'anytime'
    || leaf.timeAfter.trim() !== ''
    || leaf.timeBefore.trim() !== ''
    || leaf.timeAggregation !== 'None'
    || leaf.valueAggregation !== 'None'
    || leaf.atLeast !== null
    || leaf.atMost !== null;
}

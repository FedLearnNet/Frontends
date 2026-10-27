import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';

import {QueryBuilderItemComponent} from './query-builder-item.component';
import {QUERY_OPERATOR_OPTIONS_CONFIG} from '@global-app/find-data/configs/query-option';
import {QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {QueryConfig} from '@global-app/find-data/models';
import {createEmptyLeaf, QueryLeafNode} from '@global-app/find-data/models/query-tree';
import {DataTypes} from '@global-app/schema/dto/datatype';

describe('QueryBuilderItemComponent', () => {
  let component: QueryBuilderItemComponent;
  let fixture: ComponentFixture<QueryBuilderItemComponent>;
  const queryConfig: QueryConfig = {
    schemaIds: [],
    subscriptionCount: 0,
    name: 'weight',
    label: 'Weight',
    ontology: {id: 'vitals'} as any,
    dataType: {id: 'weight-value', type: DataTypes.FLOAT} as any,
    queryOperatorOption: {
      type: DataTypes.FLOAT,
      description: 'number',
      options: [{label: 'Equals', value: QueryOperatorTypes.EQUAL}],
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QueryBuilderItemComponent, TranslateModule.forRoot()],
    });
    fixture = TestBed.createComponent(QueryBuilderItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('leaf', createEmptyLeaf());
    fixture.componentRef.setInput('queryConfigs', [queryConfig]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill the form from an existing leaf', () => {
    fixture.componentRef.setInput('leaf', {
      ...createEmptyLeaf(),
      catalogName: 'weight',
      ontologyId: 'vitals',
      dataTypeId: 'weight-value',
      operator: QueryOperatorTypes.EQUAL,
      value: '70',
    });
    fixture.detectChanges();

    expect(component.form.getRawValue()).toEqual(jasmine.objectContaining({
      value: '70',
      operator: QueryOperatorTypes.EQUAL,
    }));
    expect(component.catalogControl.value).toBe('weight');
    expect(component.operatorOptions()).toEqual([
      {label: 'Equals (=)', value: QueryOperatorTypes.EQUAL},
    ]);
  });

  it('shows string operators with the listed spellings', () => {
    const stringOperators = QUERY_OPERATOR_OPTIONS_CONFIG.find(item => item.type === DataTypes.STRING)!;
    const stringConfig: QueryConfig = {
      schemaIds: [],
      subscriptionCount: 0,
      name: 'note',
      label: 'Note',
      ontology: {id: 'notes'} as any,
      dataType: {id: 'note-value', type: DataTypes.STRING} as any,
      queryOperatorOption: stringOperators,
    };
    fixture.componentRef.setInput('queryConfigs', [stringConfig]);
    fixture.componentRef.setInput('leaf', {
      ...createEmptyLeaf(),
      catalogName: 'note',
      ontologyId: 'notes',
      dataTypeId: 'note-value',
    });
    fixture.detectChanges();

    const labels = component.operatorOptions().map(option => option.label);
    expect(labels).toContain('Contains (contains)');
    expect(labels).toContain('Does not contain (!contains)');
    expect(labels).toContain('Starts with (startsWith)');
    expect(labels).toContain('Ends with (endsWith)');
    expect(labels).toContain('In (in)');
    expect(labels).toContain('Not in (!in)');
    expect(labels).toContain('Exists (exists)');
    expect(labels).toContain('Does not exist (!exists)');
    expect(labels).toContain('Matches regex (regex)');
  });

  it('inserts a one-day window for delta within and clears it for plain delta', () => {
    const emitted: QueryLeafNode[] = [];
    component.leafChange.subscribe(value => emitted.push(value));

    component.setValueMode('delta_window');
    expect(emitted.at(-1)).toEqual(jasmine.objectContaining({
      valueMode: 'delta',
      deltaWindow: true,
      deltaInterval: [{count: 1, unit: 'days'}],
    }));

    fixture.componentRef.setInput('leaf', emitted.at(-1)!);
    fixture.detectChanges();
    component.setValueMode('delta');
    expect(emitted.at(-1)).toEqual(jasmine.objectContaining({
      valueMode: 'delta',
      deltaWindow: false,
      deltaInterval: [],
    }));
  });

  it('keeps an after filter selectable before a date is entered and binds the window count', () => {
    const emitted: QueryLeafNode[] = [];
    component.leafChange.subscribe(value => emitted.push(value));

    component.setTimeFilter('after');
    expect(emitted.at(-1)?.timeFilterChoice).toBe('after');

    fixture.componentRef.setInput('leaf', emitted.at(-1)!);
    fixture.detectChanges();
    component.setTimeShape('within_at_least');
    expect(emitted.at(-1)).toEqual(jasmine.objectContaining({
      timeAggregation: 'within_at_least',
      timeWindow: [{count: 1, unit: 'weeks'}],
      timeWindowCount: 1,
    }));
    expect(component.form.controls.timeWindowCount.value).toBe(1);
  });

  it('should display the selected column with its datatype label', () => {
    expect(component.displayColumnName('weight')).toBe('weight (Weight)');
  });

  it('shows the hierarchical index and a summary of the condition', () => {
    fixture.componentRef.setInput('indexLabel', '2.1');
    fixture.componentRef.setInput('leaf', {
      ...createEmptyLeaf(),
      catalogName: 'weight',
      ontologyId: 'vitals',
      dataTypeId: 'weight-value',
      operator: QueryOperatorTypes.BIGGER,
      value: '70',
      timeAggregation: 'last',
    });
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.index-badge')?.textContent?.trim()).toBe('2.1');
    expect(element.querySelector('.leaf-summary')?.textContent?.trim()).toBe('weight > 70 (last)');
  });

  it('should not emit a change while prefilling the form', () => {
    const emittedValues: unknown[] = [];
    component.leafChange.subscribe(value => emittedValues.push(value));

    fixture.componentRef.setInput('leaf', {
      ...createEmptyLeaf(),
      catalogName: 'weight',
      ontologyId: 'vitals',
      dataTypeId: 'weight-value',
      operator: QueryOperatorTypes.EQUAL,
      value: '70',
    });
    fixture.detectChanges();

    expect(emittedValues).toEqual([]);
  });
});

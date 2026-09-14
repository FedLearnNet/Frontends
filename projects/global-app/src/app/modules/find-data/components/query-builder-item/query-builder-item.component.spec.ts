import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryBuilderItemComponent } from './query-builder-item.component';
import {QueryOperatorTypes} from "@global-app/find-data/dto/query";
import {QueryConfig} from "@global-app/find-data/models";
import {DataTypes} from "@global-app/schema/dto/datatype";

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
    imports: [QueryBuilderItemComponent]
});
    fixture = TestBed.createComponent(QueryBuilderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill the form from an existing query item', () => {
    fixture.componentRef.setInput('queryConfigs', [queryConfig]);
    fixture.componentRef.setInput('queryItem', {
      ontologyId: 'vitals',
      dataTypeId: 'weight-value',
      operator: [{operator: QueryOperatorTypes.EQUAL, value: '70'}],
    });
    fixture.detectChanges();

    expect(component.queryBuilderFormGroup.getRawValue()).toEqual(jasmine.objectContaining({
      name: 'weight',
      value: '70',
      operator: QueryOperatorTypes.EQUAL,
      ontologyId: 'vitals',
      dataTypeId: 'weight-value',
    }));
    expect(component.queryOptions).toEqual(queryConfig.queryOperatorOption!.options);
  });

  it('should display the selected column with its datatype label', () => {
    fixture.componentRef.setInput('queryConfigs', [queryConfig]);
    fixture.detectChanges();

    expect(component.displayColumnName('weight')).toBe('weight (Weight)');
  });

  it('should not emit a change while prefilling the form', () => {
    const emittedValues: unknown[] = [];
    component.queryItemChange.subscribe(value => emittedValues.push(value));

    fixture.componentRef.setInput('queryConfigs', [queryConfig]);
    fixture.componentRef.setInput('queryItem', {
      ontologyId: 'vitals',
      dataTypeId: 'weight-value',
      operator: [{operator: QueryOperatorTypes.EQUAL, value: '70'}],
    });
    fixture.detectChanges();

    expect(emittedValues).toEqual([]);
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {QueryDetailCardComponent} from './query-detail-card.component';
import {QueryDetailDTO, QueryOperatorTypes} from "@global-app/find-data/dto/query";
import {LocalQueryDto} from "../../../../../../local-app/src/app/modules/logs/dto/query";

describe('QueryDetailCardComponent', () => {
  let component: QueryDetailCardComponent;
  let fixture: ComponentFixture<QueryDetailCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryDetailCardComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryDetailCardComponent);
    component = fixture.componentInstance;
  });

  it('should render local query status details', () => {
    const query: LocalQueryDto = {
      id: 7,
      version: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      globalQueryId: 11,
      status: 'completed',
      statusMessage: 'Done',
      query: {connectingOperator: 'AND', conditions: []},
      enhancedQuery: [{
        ontologyId: 'vitals',
        dataTypeId: 'weight',
        operator: QueryOperatorTypes.EQUAL,
        value: '70',
        schemaNodes: [{
          id: 1,
          version: 1,
          createdAt: new Date('2026-01-01T00:00:00Z'),
          updatedAt: new Date('2026-01-01T00:00:00Z'),
          nodeType: 'ATTRIBUTE' as any,
          name: 'Weight',
          globalId: 'weight',
          ontology: {} as any,
          dataType: {} as any,
        }],
      }],
    };

    fixture.componentRef.setInput('query', query);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Done');
    expect(fixture.nativeElement.textContent).toContain('Weight');
  });

  it('should hide local-only status fields for global query details', () => {
    const query: QueryDetailDTO = {
      id: 9,
      version: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      name: 'Global query',
      description: 'desc',
      result: 0,
      hasResult: false,
      hasFired: false,
      keycloakId: 'abc',
      globalUniqueId: 'global-9',
      groupId: 'group-1',
      query: {
        connectingOperator: 'AND',
        conditions: [],
      },
      enhancedQuery: [{
        ontologyId: 'vitals',
        dataTypeId: 'weight',
        ontologyName: 'Vitals',
        operator: QueryOperatorTypes.EQUAL,
        value: '70',
      }],
    };

    fixture.componentRef.setInput('query', query);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Vitals / weight');
    expect(fixture.nativeElement.textContent).not.toContain('Done');
  });

  it('should render a query group when there is no flat enhanced query', () => {
    const query: QueryDetailDTO = {
      id: 9,
      version: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      name: 'Global query',
      description: 'desc',
      result: 3,
      hasResult: true,
      hasFired: true,
      keycloakId: 'abc',
      globalUniqueId: 'global-9',
      groupId: 'group-1',
      query: {
        connectingOperator: 'OR',
        temporalRelations: [{sourceCondition: 0, targetCondition: 0, relationship: 'IN_THE_FOLLOWING', interval: [{count: 2, unit: 'WEEKS'}]}],
        conditions: [{
          ontologyId: 'value-ontology-uuid',
          dataTypeId: 'value-datatype-uuid',
          operator: QueryOperatorTypes.BIGGER,
          value: 100,
          timeAggregationMethod: 'FIRST',
        }],
      },
    };

    fixture.componentRef.setInput('query', query);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('value-ontology-uuid / value-datatype-uuid');
    expect(fixture.nativeElement.textContent).toContain('100');
    expect(fixture.nativeElement.textContent).toContain('Or');
    expect(fixture.nativeElement.textContent).toContain('in the following 2 weeks');
  });
});

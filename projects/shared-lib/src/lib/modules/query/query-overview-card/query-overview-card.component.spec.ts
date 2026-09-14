import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueryOverviewCardComponent } from './query-overview-card.component';
import {QueryDetailDTO} from "@global-app/find-data/dto/query";
import {LocalQueryDto} from "../../../../../../local-app/src/app/modules/logs/dto/query";

describe('QueryOverviewCardComponent', () => {
  let component: QueryOverviewCardComponent;
  let fixture: ComponentFixture<QueryOverviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryOverviewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryOverviewCardComponent);
    component = fixture.componentInstance;
  });

  it('should render a local query with schema node labels', () => {
    const query: LocalQueryDto = {
      id: 7,
      version: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      globalQueryId: 11,
      status: 'completed',
      statusMessage: 'Done',
      query: [],
      enhancedQuery: [{
        ontologyId: 'vitals',
        dataTypeId: 'weight',
        operator: [{operator: 'EQUAL' as any, value: '70'}],
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
    expect(fixture.nativeElement.textContent).toContain('Weight: = 70');
  });

  it('should render a global query detail with reduced labels', () => {
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
      query: [{
        ontologyId: 'vitals',
        dataTypeId: 'weight',
        operator: [{operator: 'EQUAL' as any, value: '70'}],
      }],
      enhancedQuery: [{
        ontologyId: 'vitals',
        dataTypeId: 'weight',
        ontologyName: 'Vitals',
        operator: [{operator: 'EQUAL' as any, value: '70'}],
      }],
    };

    fixture.componentRef.setInput('query', query);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Vitals / weight: = 70');
  });
});

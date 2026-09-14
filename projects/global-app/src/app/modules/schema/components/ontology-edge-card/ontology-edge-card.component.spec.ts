import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyEdgeCardComponent } from './ontology-edge-card.component';

describe('OntologyEdgeCardComponent', () => {
  let component: OntologyEdgeCardComponent;
  let fixture: ComponentFixture<OntologyEdgeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologyEdgeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OntologyEdgeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

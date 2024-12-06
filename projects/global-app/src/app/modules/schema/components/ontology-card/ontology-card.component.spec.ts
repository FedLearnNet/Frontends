import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyCardComponent } from './ontology-card.component';

describe('OntologyCardComponent', () => {
  let component: OntologyCardComponent;
  let fixture: ComponentFixture<OntologyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OntologyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

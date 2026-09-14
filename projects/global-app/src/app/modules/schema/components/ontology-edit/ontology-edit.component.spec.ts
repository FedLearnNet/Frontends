import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyEditComponent } from './ontology-edit.component';

describe('OntologyEditComponent', () => {
  let component: OntologyEditComponent;
  let fixture: ComponentFixture<OntologyEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologyEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OntologyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

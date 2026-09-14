import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologySelectDialogComponent } from './ontology-select-dialog.component';

describe('OntologySelectDialogComponent', () => {
  let component: OntologySelectDialogComponent;
  let fixture: ComponentFixture<OntologySelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologySelectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OntologySelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyAddDialogComponent } from './ontology-add-dialog.component';

describe('OntologyAddDialogComponent', () => {
  let component: OntologyAddDialogComponent;
  let fixture: ComponentFixture<OntologyAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologyAddDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OntologyAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

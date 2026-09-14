import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortCreateDialogComponent } from './cohort-create-dialog.component';

describe('CohortCreateDialogComponent', () => {
  let component: CohortCreateDialogComponent;
  let fixture: ComponentFixture<CohortCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohortCreateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CohortCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

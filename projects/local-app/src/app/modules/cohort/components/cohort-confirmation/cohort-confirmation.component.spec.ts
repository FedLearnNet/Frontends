import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortConfirmationComponent } from './cohort-confirmation.component';

describe('CohortConfirmationComponent', () => {
  let component: CohortConfirmationComponent;
  let fixture: ComponentFixture<CohortConfirmationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CohortConfirmationComponent]
    });
    fixture = TestBed.createComponent(CohortConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortDetailComponent } from './cohort-detail.component';

describe('CohortDetailFormComponent', () => {
  let component: CohortDetailComponent;
  let fixture: ComponentFixture<CohortDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [CohortDetailComponent]
});
    fixture = TestBed.createComponent(CohortDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

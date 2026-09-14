import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohortComponent } from './cohort.component';

describe('AddDataComponent', () => {
  let component: CohortComponent;
  let fixture: ComponentFixture<CohortComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [CohortComponent]
});
    fixture = TestBed.createComponent(CohortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CohortOverviewComponent} from './cohort-overview.component';

describe('CohortOverviewComponent', () => {
  let fixture: ComponentFixture<CohortOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [CohortOverviewComponent]
});
    fixture = TestBed.createComponent(CohortOverviewComponent);
    fixture.detectChanges();
  });
});

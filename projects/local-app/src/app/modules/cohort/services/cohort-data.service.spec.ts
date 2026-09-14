import { TestBed } from '@angular/core/testing';

import { CohortDataService } from './cohort-data.service';

describe('CohortDataService', () => {
  let service: CohortDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CohortDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

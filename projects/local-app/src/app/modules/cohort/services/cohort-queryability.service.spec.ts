import {TestBed} from '@angular/core/testing';

import {CohortQueryabilityService} from './cohort-queryability.service';

describe('CohortQueryabilityService', () => {
  let service: CohortQueryabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CohortQueryabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

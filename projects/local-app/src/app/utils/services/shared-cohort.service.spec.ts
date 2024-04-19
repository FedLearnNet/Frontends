import { TestBed } from '@angular/core/testing';

import { SharedCohortService } from './shared-cohort.service';

describe('SharedCohortService', () => {
  let service: SharedCohortService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedCohortService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

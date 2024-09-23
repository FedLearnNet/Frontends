import { TestBed } from '@angular/core/testing';

import { SchemaDataService } from './schema-data.service';

describe('SchemaDataService', () => {
  let service: SchemaDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SchemaDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SchemaDetailComponent} from './schema-detail.component';

describe('SchemaDetailComponent', () => {
  let fixture: ComponentFixture<SchemaDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SchemaDetailComponent]
});
    fixture = TestBed.createComponent(SchemaDetailComponent);
    fixture.detectChanges();
  });
});

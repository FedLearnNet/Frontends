import {ComponentFixture, TestBed} from '@angular/core/testing';

import {QueryLogDetailDialogComponent} from './query-log-detail-dialog.component';

describe('PatientQueryLogDetailComponent', () => {
  let fixture: ComponentFixture<QueryLogDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryLogDetailDialogComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(QueryLogDetailDialogComponent);
    fixture.detectChanges();
  });
});

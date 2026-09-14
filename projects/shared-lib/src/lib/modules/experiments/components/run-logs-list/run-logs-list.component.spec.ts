import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunLogsListComponent } from './run-logs-list.component';

describe('RunLogsListComponent', () => {
  let component: RunLogsListComponent;
  let fixture: ComponentFixture<RunLogsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunLogsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunLogsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

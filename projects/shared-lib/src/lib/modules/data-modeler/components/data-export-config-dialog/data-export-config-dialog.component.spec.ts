import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataExportConfigDialogComponent } from './data-export-config-dialog.component';

describe('DataExportConfigDialogComponent', () => {
  let component: DataExportConfigDialogComponent;
  let fixture: ComponentFixture<DataExportConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataExportConfigDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataExportConfigDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

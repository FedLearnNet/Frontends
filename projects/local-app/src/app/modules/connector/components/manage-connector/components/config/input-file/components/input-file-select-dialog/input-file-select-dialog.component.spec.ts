import { ComponentFixture, TestBed } from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

import { InputFileSelectDialogComponent } from './input-file-select-dialog.component';

describe('InputFileSelectDialogComponent', () => {
  let component: InputFileSelectDialogComponent;
  let fixture: ComponentFixture<InputFileSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputFileSelectDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {files: [], selectedFileId: null}},
        {provide: MatDialogRef, useValue: {close: jasmine.createSpy('close')}},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputFileSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

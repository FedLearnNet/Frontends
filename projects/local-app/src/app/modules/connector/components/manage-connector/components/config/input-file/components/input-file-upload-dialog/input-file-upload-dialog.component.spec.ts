import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';

import {
  InputFileUploadDialogComponent,
  InputFileUploadDialogResult
} from './input-file-upload-dialog.component';
import {ConnectorUploadService} from '../../../../../../../services/connector-upload.service';
import {ConnectorFilesDetailDTO} from '../../../../../../../dto/upload-info';

describe('InputFileUploadDialogComponent', () => {
  let component: InputFileUploadDialogComponent;
  let fixture: ComponentFixture<InputFileUploadDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<InputFileUploadDialogComponent, InputFileUploadDialogResult>>;
  let uploadService: jasmine.SpyObj<ConnectorUploadService>;

  const uploadedFile = {
    id: 17,
    version: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    fileName: 'patients.tsv',
    contentType: 'text/tab-separated-values',
    downloadUrl: '',
    size: 20,
    uploadInfo: [{
      sheet: '0',
      json: '[{"id":"1","value":"A"}]',
      columns: ['id', 'value'],
      renamedColumns: ['id', 'value'],
      deletedColumns: [false, false],
      columnProfiles: [],
    }],
  } as ConnectorFilesDetailDTO;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    uploadService = jasmine.createSpyObj('ConnectorUploadService', ['uploadFile']);
    uploadService.uploadFile.and.returnValue(of(uploadedFile));
    await TestBed.configureTestingModule({
      imports: [InputFileUploadDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: ConnectorUploadService, useValue: uploadService},
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            cohortId: 6,
            settings: {
              fileType: 'CSV',
              delimiter: ',',
              hasHeader: true,
              firstSheetOnly: true,
              hasSupportFile: false,
              deleteUnneededFileAfterSuccess: true,
            },
          }
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputFileUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uploads a tab-separated file with its parsing settings and returns the analyzed file', () => {
    const file = new File(['id\tvalue'], 'patients.tsv', {type: 'text/tab-separated-values'});

    component.selectFile(file);
    component.submit();
    component.useUploadedFile();

    expect(dialogRef.close).toHaveBeenCalledWith({
      uploadedFile,
      settings: {
        fileType: 'CSV',
        delimiter: '\t',
        customDelimiter: undefined,
        hasHeader: true,
        firstSheetOnly: true,
        hasSupportFile: false,
        deleteUnneededFileAfterSuccess: true,
      },
    });
    expect(uploadService.uploadFile).toHaveBeenCalledWith(
      6,
      file,
      false,
      false,
      jasmine.objectContaining({delimiter: '\t', firstSheetOnly: true}),
    );
  });

  it('detects Excel workbooks', () => {
    component.selectFile(new File(['workbook'], 'patients.xlsx'));

    expect(component.form.controls.fileType.value).toBe('EXCEL');
  });

  it('detects archives containing multiple CSV files', () => {
    component.selectFile(new File(['archive'], 'patients.zip'));

    expect(component.form.controls.fileType.value).toBe('CSV');
    expect(component.form.controls.firstSheetOnly.value).toBeFalse();
  });
});

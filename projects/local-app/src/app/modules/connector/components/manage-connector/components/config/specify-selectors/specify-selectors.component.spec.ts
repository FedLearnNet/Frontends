import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateModule} from '@ngx-translate/core';
import {of} from 'rxjs';
import {ConnectorStepSpecifySelectorsComponent} from './specify-selectors.component';
import {ConnectorUploadService} from '../../../../../services/connector-upload.service';
import {ConnectorPreviewService} from '../../../../../services/connector-preview.service';
import {ConnectorDTO, PivotMode, PivotValueFormat, SheetMergeResultDTO} from '../../../../../dto/connector';
import {UploadInfoDTO} from '../../../../../dto/upload-info';
import {MergeSheetsDialogComponent} from './components/merge-sheets/merge-sheets.component';
import {PivotTableDialogComponent} from '../pivot-table-dialog/pivot-table-dialog.component';

describe('ConnectorStepSpecifySelectorsComponent pivot configuration', () => {
  let fixture: ComponentFixture<ConnectorStepSpecifySelectorsComponent>;
  let component: ConnectorStepSpecifySelectorsComponent;
  let previewService: jasmine.SpyObj<ConnectorPreviewService>;
  let uploadService: jasmine.SpyObj<ConnectorUploadService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const sheet = (name: string, columns: string[]): UploadInfoDTO => ({
    sheet: name,
    json: JSON.stringify([Object.fromEntries(columns.map((column, index) => [column, index + 1]))]),
    data: [Object.fromEntries(columns.map((column, index) => [column, index + 1]))],
    columns,
    renamedColumns: [...columns],
    deletedColumns: new Array(columns.length).fill(false),
  });

  const createConfig = (
    fileInfo: Record<string, UploadInfoDTO>,
    extras: Partial<ConnectorDTO> = {}
  ): ConnectorDTO => ({
    cohortId: 7,
    inputConfig: {
      mode: 'FILE',
      fileId: 11,
      fileType: Object.keys(fileInfo).length > 1 ? 'EXCEL' : 'CSV',
      firstSheetOnly: Object.keys(fileInfo).length === 1,
      hasHeader: true,
      delimiter: ',',
    },
    fileInfo,
    uploadInfo: fileInfo,
    ...extras,
  } as ConnectorDTO);

  const createComponent = (config: ConnectorDTO): void => {
    uploadService.getFileDetail.and.returnValue(of({
      uploadInfo: Object.entries(config.fileInfo ?? {}).map(([name, info]) => ({
        ...info,
        sheet: name,
        columnProfiles: info.columnProfiles ?? [],
      }))
    } as any));
    fixture = TestBed.createComponent(ConnectorStepSpecifySelectorsComponent);
    fixture.componentRef.setInput('config', config);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    previewService = jasmine.createSpyObj<ConnectorPreviewService>('ConnectorPreviewService', ['previewPivot']);
    previewService.previewPivot.and.returnValue(of([]));
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue({afterClosed: () => of(undefined)} as any);
    snackBar = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    uploadService = jasmine.createSpyObj<ConnectorUploadService>('ConnectorUploadService', ['getFileDetail']);

    await TestBed.configureTestingModule({
      imports: [ConnectorStepSpecifySelectorsComponent, TranslateModule.forRoot()],
      providers: [
        {provide: ConnectorUploadService, useValue: uploadService},
        {provide: ConnectorPreviewService, useValue: previewService},
        {provide: MatDialog, useValue: dialog},
        {provide: MatSnackBar, useValue: snackBar},
      ]
    }).compileComponents();
  });

  it('calls the backend only after pivot configuration is applied', () => {
    createComponent(createConfig({'patients.csv': sheet('patients.csv', ['patientId', 'field', 'value'])}));

    component.openPivotDialog();
    expect(previewService.previewPivot).not.toHaveBeenCalled();

    dialog.open.and.returnValue({
      afterClosed: () => of({
        applied: true,
        pivotConfig: {valueColumnIndex: {'patients.csv': 1}}
      })
    } as any);
    component.openPivotDialog();

    expect(previewService.previewPivot).toHaveBeenCalled();
    expect(component.config().pivotConfig).toEqual({
      valueColumnIndex: {'patients.csv': 1}
    });
  });

  it('preserves long-to-wide settings when a single-table key is reconciled', () => {
    createComponent(createConfig(
      {'patients.csv': sheet('patients.csv', ['patientId', 'field', 'value'])},
      {
        pivotConfig: {
          valueColumnIndex: {'0': 1},
          mode: {'0': PivotMode.ONE_HOT},
          prefix: {'0': 'icd_'},
          valueFormat: {'0': PivotValueFormat.ONE_ZERO},
        }
      }
    ));

    expect(component.config().pivotConfig).toEqual({
      valueColumnIndex: {'patients.csv': 1},
      mode: {'patients.csv': PivotMode.ONE_HOT},
      prefix: {'patients.csv': 'icd_'},
      valueFormat: {'patients.csv': PivotValueFormat.ONE_ZERO},
    });
  });

  it('places pivot configuration before merge configuration in the UI', () => {
    createComponent(createConfig({
      Sheet1: sheet('Sheet1', ['patientId', 'field']),
      Sheet2: sheet('Sheet2', ['patientId', 'field']),
    }));

    const element = fixture.nativeElement as HTMLElement;
    const pivot = element.querySelector('[data-testid="pivot-config"]');
    const merge = element.querySelector('.multi-sheet-container');

    expect(pivot).not.toBeNull();
    expect(merge).not.toBeNull();
    expect(pivot!.compareDocumentPosition(merge!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('refreshes merge columns from a successful pivot preview', () => {
    const mergeConfig: SheetMergeResultDTO = {
      uidColumn: 'patientId',
      sheetUidMapping: {Sheet1: 'patientId', Sheet2: 'patientId'},
      commonUidColumnName: 'patientId',
    };
    createComponent(createConfig({
      Sheet1: sheet('Sheet1', ['patientId', 'field', 'value']),
      Sheet2: sheet('Sheet2', ['patientId', 'field', 'value']),
    }, {
      pivotConfig: {valueColumnIndex: {Sheet1: 1, Sheet2: 1}},
      mergeConfig,
    }));
    previewService.previewPivot.and.returnValue(of([
      [{patientId: 1, glucose: 123}],
      [{patientId: 1, insulin: 8}],
    ]));
    dialog.open.and.returnValue({
      afterClosed: () => of({
        applied: true,
        pivotConfig: {valueColumnIndex: {Sheet1: 1, Sheet2: 1}}
      })
    } as any);

    component.openPivotDialog();

    expect(dialog.open.calls.first().args[0]).toBe(PivotTableDialogComponent);
    dialog.open.and.returnValue({afterClosed: () => of(undefined)} as any);
    component.openMergeDialog();
    const [dialogComponent, dialogConfig] = dialog.open.calls.mostRecent().args;
    expect(dialogComponent).toBe(MergeSheetsDialogComponent);
    expect((dialogConfig?.data as any).sheets).toEqual([
      {name: 'Sheet1', columns: ['patientId', 'glucose']},
      {name: 'Sheet2', columns: ['patientId', 'insulin']},
    ]);
  });

  it('reapplies saved pivot configuration after header preview data is reloaded', () => {
    previewService.previewPivot.and.returnValue(of([
      [{patientId: 1, icd_A: true, icd_B: false}],
    ]));

    createComponent(createConfig(
      {'diagnoses.csv': sheet('diagnoses.csv', ['patientId', 'icdCode'])},
      {
        pivotConfig: {
          valueColumnIndex: {'diagnoses.csv': 1},
          mode: {'diagnoses.csv': PivotMode.ONE_HOT},
          prefix: {'diagnoses.csv': 'icd_'},
          valueFormat: {'diagnoses.csv': PivotValueFormat.TRUE_FALSE},
        }
      }
    ));

    expect(previewService.previewPivot).toHaveBeenCalled();
    expect(component.sheets[0].info.columns).toEqual(['patientId', 'icd_A', 'icd_B']);
    expect(component.sheets[0].info.json).toEqual([
      {patientId: 1, icd_A: true, icd_B: false},
    ]);
  });
});

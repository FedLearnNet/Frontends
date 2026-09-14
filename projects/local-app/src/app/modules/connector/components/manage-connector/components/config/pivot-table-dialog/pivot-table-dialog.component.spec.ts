import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateModule} from '@ngx-translate/core';
import {
  PivotTableDialogComponent,
  PivotTableDialogData,
  PivotTableDialogResult
} from './pivot-table-dialog.component';
import {PivotMode, PivotValueFormat} from '../../../../../dto/connector';

describe('PivotTableDialogComponent', () => {
  let fixture: ComponentFixture<PivotTableDialogComponent>;
  let component: PivotTableDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<PivotTableDialogComponent>>;

  const sourceSheet = (name: string): PivotTableDialogData['sheets'][number] => ({
    name,
    info: {
      json: [
        {field: 'patient_id', 'patient-1': 'p1', 'patient-2': 'p2'},
        {field: 'age', 'patient-1': 31, 'patient-2': 42},
      ],
      columns: ['field', 'patient-1', 'patient-2'],
      renamedColumns: ['field', 'patient-1', 'patient-2'],
      deletedColumns: [false, false, false],
    }
  });

  const createComponent = async (data: PivotTableDialogData): Promise<void> => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<PivotTableDialogComponent>>(
      'MatDialogRef',
      ['updateSize', 'close']
    );

    await TestBed.configureTestingModule({
      imports: [PivotTableDialogComponent, TranslateModule.forRoot()],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: data},
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MatDialog, useValue: jasmine.createSpyObj<MatDialog>('MatDialog', ['open'])},
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PivotTableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('stores a single-file zero-based pivot column under the real file name', async () => {
    await createComponent({sheets: [sourceSheet('patients.csv')]});

    component.selectPivotColumn('patients.csv', 0);
    component.apply();

    const result = dialogRef.close.calls.mostRecent().args[0] as PivotTableDialogResult;
    expect(result.pivotConfig).toEqual({valueColumnIndex: {'patients.csv': 0}});
  });

  it('stores different pivot columns for multiple sheets', async () => {
    await createComponent({sheets: [sourceSheet('Demographics'), sourceSheet('Observations')]});

    component.selectPivotColumn('Demographics', 0);
    component.selectPivotColumn('Observations', 1);
    component.apply();

    const result = dialogRef.close.calls.mostRecent().args[0] as PivotTableDialogResult;
    expect(result.pivotConfig?.valueColumnIndex).toEqual({Demographics: 0, Observations: 1});
  });

  it('clears pivot configuration when do not pivot is selected', async () => {
    await createComponent({
      sheets: [sourceSheet('Demographics'), sourceSheet('Observations')],
      pivotConfig: {valueColumnIndex: {Demographics: 0, Observations: 1}},
    });

    component.doNotPivot();

    const result = dialogRef.close.calls.mostRecent().args[0] as PivotTableDialogResult;
    expect(result).toEqual({applied: true, pivotConfig: undefined});
  });

  it('uses two shared buttons and does not render a pivot toggle', async () => {
    await createComponent({sheets: [sourceSheet('patients.csv')]});

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('mat-dialog-actions lib-btn').length).toBe(2);
    expect(element.querySelector('mat-slide-toggle')).toBeNull();
  });

  it('preserves pivot configuration supplied while editing', async () => {
    await createComponent({
      sheets: [sourceSheet('patients.csv')],
      pivotConfig: {valueColumnIndex: {'patients.csv': 0}},
    });

    expect(component.getPivotColumnIndex('patients.csv')).toBe(0);
    expect(component.previewSheets[0].info.columns).toEqual(['field', 'patient_id', 'age']);
  });

  it('blocks apply when a sheet has no value column', async () => {
    await createComponent({sheets: [sourceSheet('patients.csv')]});

    component.apply();

    expect(component.previewError).toBeTruthy();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('automatically calculates and displays the local preview when configuration changes', async () => {
    await createComponent({sheets: [sourceSheet('patients.csv')]});
    component.selectPivotColumn('patients.csv', 0);

    fixture.detectChanges();

    expect(component.previewSheets[0].info.columns).toEqual(['field', 'patient_id', 'age']);
    expect(component.previewSheets[0].info.json).toEqual([
      {field: 'patient-1', patient_id: 'p1', age: 31},
      {field: 'patient-2', patient_id: 'p2', age: 42},
    ]);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('patient_id');
    expect(text).toContain('p1');
    expect(text).toContain('42');
  });

  it('converts duplicate long-format field values to true/false columns', async () => {
    await createComponent({
      sheets: [{
        name: 'diagnoses.csv',
        info: {
          json: [
            {subject_id: 10035185, hadm_id: 22580999, seq_num: 3, icd_code: '4139', icd_version: 9},
            {subject_id: 10035185, hadm_id: 22580999, seq_num: 10, icd_code: 'V707', icd_version: 9},
            {subject_id: 10035185, hadm_id: 22580999, seq_num: 11, icd_code: '4139', icd_version: 9},
            {subject_id: 10009049, hadm_id: 22995465, seq_num: 2, icd_code: '4829', icd_version: 9},
          ],
          columns: ['subject_id', 'hadm_id', 'seq_num', 'icd_code', 'icd_version'],
          renamedColumns: ['subject_id', 'hadm_id', 'seq_num', 'icd_code', 'icd_version'],
          deletedColumns: [false, false, false, false, false],
        }
      }]
    });
    component.selectPivotColumn('diagnoses.csv', 3);
    component.selectPivotMode('diagnoses.csv', PivotMode.ONE_HOT);

    expect(component.previewError).toBeUndefined();
    expect(component.previewSheets[0].info.columns).toEqual([
      'subject_id', 'hadm_id', 'seq_num', 'icd_version', '4139', 'V707', '4829'
    ]);
    expect(component.previewSheets[0].info.json).toEqual([
      {
        subject_id: 10035185, hadm_id: 22580999, seq_num: 3, icd_version: 9,
        '4139': true, V707: false, '4829': false
      },
      {
        subject_id: 10035185, hadm_id: 22580999, seq_num: 10, icd_version: 9,
        '4139': false, V707: true, '4829': false
      },
      {
        subject_id: 10035185, hadm_id: 22580999, seq_num: 11, icd_version: 9,
        '4139': true, V707: false, '4829': false
      },
      {
        subject_id: 10009049, hadm_id: 22995465, seq_num: 2, icd_version: 9,
        '4139': false, V707: false, '4829': true
      },
    ]);

    component.apply();
    const result = dialogRef.close.calls.mostRecent().args[0] as PivotTableDialogResult;
    expect(result.pivotConfig).toEqual({
      valueColumnIndex: {'diagnoses.csv': 3},
      mode: {'diagnoses.csv': PivotMode.ONE_HOT},
      prefix: {'diagnoses.csv': ''},
      valueFormat: {'diagnoses.csv': PivotValueFormat.TRUE_FALSE},
    });
  });

  it('applies a generated-column prefix and yes/no values', async () => {
    await createComponent({
      sheets: [{
        name: 'diagnoses.csv',
        info: {
          json: [
            {patient_id: 'p1', icd_code: 'A'},
            {patient_id: 'p1', icd_code: 'B'},
            {patient_id: 'p2', icd_code: 'A'},
          ],
          columns: ['patient_id', 'icd_code'],
          renamedColumns: ['patient_id', 'icd_code'],
          deletedColumns: [false, false],
        }
      }]
    });
    component.selectPivotColumn('diagnoses.csv', 1);
    component.selectPivotMode('diagnoses.csv', PivotMode.ONE_HOT);
    component.selectPrefix('diagnoses.csv', 'icd_');
    component.selectValueFormat('diagnoses.csv', PivotValueFormat.YES_NO);

    expect(component.previewSheets[0].info.columns).toEqual(['patient_id', 'icd_A', 'icd_B']);
    expect(component.previewSheets[0].info.json).toEqual([
      {patient_id: 'p1', icd_A: 'yes', icd_B: 'no'},
      {patient_id: 'p1', icd_A: 'no', icd_B: 'yes'},
      {patient_id: 'p2', icd_A: 'yes', icd_B: 'no'},
    ]);

    component.apply();
    const result = dialogRef.close.calls.mostRecent().args[0] as PivotTableDialogResult;
    expect(result.pivotConfig?.prefix).toEqual({'diagnoses.csv': 'icd_'});
    expect(result.pivotConfig?.valueFormat).toEqual({'diagnoses.csv': PivotValueFormat.YES_NO});
  });

  it('uses the source row index when no identifier columns are selected', async () => {
    await createComponent({sheets: [sourceSheet('patients.csv')]});
    component.selectPivotColumn('patients.csv', 0);
    component.selectPivotMode('patients.csv', PivotMode.ONE_HOT);

    expect(component.isValid()).toBeTrue();
    expect(component.previewSheets[0].info.columns).toEqual([
      'patient-1', 'patient-2', 'patient_id', 'age'
    ]);
    expect(component.previewSheets[0].info.json).toEqual([
      {'patient-1': 'p1', 'patient-2': 'p2', patient_id: true, age: false},
      {'patient-1': 31, 'patient-2': 42, patient_id: false, age: true},
    ]);
  });
});

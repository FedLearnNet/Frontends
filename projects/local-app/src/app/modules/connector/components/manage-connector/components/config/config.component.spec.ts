import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, provideRouter, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {provideTranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';

import {ConnectorStepConfigComponent} from './config.component';
import {ConnectorService} from '../../../../services/connector-crud.service';
import {ConnectorDTO} from '../../../../dto/connector';
import {ConnectorFilesDetailDTO, UploadInfoDTO} from '../../../../dto/upload-info';
import {ConnectorUploadService} from '../../../../services/connector-upload.service';
import {ConnectorStepConfigs} from '../../../../enum/connector-step-config';
import {ConnectorStepDataSourceInputFileConfigComponent} from './input-file/input-file.component';
import {RunNewFileComponent} from '../../../run-connector/components/run-new-file/run-new-file.component';

describe('ConnectorStepConfigComponent', () => {
  let component: ConnectorStepConfigComponent;
  let fixture: ComponentFixture<ConnectorStepConfigComponent>;
  let save: jasmine.Spy;
  let navigate: jasmine.Spy;
  let snackBarOpen: jasmine.Spy;
  let emitted: ConnectorDTO[];

  beforeEach(async () => {
    save = jasmine.createSpy('save').and.returnValue(of({}));
    navigate = jasmine.createSpy('navigate').and.resolveTo(true);
    snackBarOpen = jasmine.createSpy('open');
    await TestBed.configureTestingModule({
      imports: [ConnectorStepConfigComponent],
      providers: [
        provideTranslateService(),
        {provide: ConnectorService, useValue: {save}},
        {provide: Router, useValue: {navigate}},
        {provide: ActivatedRoute, useValue: {}},
        {provide: MatSnackBar, useValue: {open: snackBarOpen}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectorStepConfigComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.configChange.subscribe(config => emitted.push(config));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /**
   * A saved connector set up for the SUR sample ZIP, whose file was deleted after a successful run,
   * is given a new ZIP on its file step.
   */
  describe('when a saved connector whose file is gone gets a new one', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('config', savedConnectorWithoutFile());
      fixture.detectChanges();
    });

    it('saves it and reopens the wizard with it when the file has the same structure', () => {
      component.handleConfigChange(withNewFile(surTables()));

      expect(save).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledOnceWith([], jasmine.objectContaining({queryParams: {uploaded: true}}));
      expect(snackBarOpen).not.toHaveBeenCalled();
      expect(emitted.at(-1)!.mergeConfig).toEqual(surMerge());
    });

    it('stays on the step, unsaved, when the file has other tables', () => {
      component.handleConfigChange(withNewFile(restructuredTables()));

      expect(save).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      // The user already agreed to this in the confirmation before the file was applied.
      expect(snackBarOpen).not.toHaveBeenCalled();
    });

    it('drops the merge of the old tables, so Specify Headers shows the new ones', () => {
      component.handleConfigChange(withNewFile(restructuredTables()));

      const config = emitted.at(-1)!;
      expect(config.mergeConfig).toBeUndefined();
      expect(Object.keys(config.fileInfo!)).toEqual(['patients', 'prescriptions']);
      expect(config.schemaMapping).toEqual(savedConnectorWithoutFile().schemaMapping);
    });

    it('keeps the merge but stays on the step when only a mapped column is gone', () => {
      const tables = surTables();
      tables['SUR_socioeconomics'] = table('SUR_socioeconomics', ['patient_id', 'marital_status']);

      component.handleConfigChange(withNewFile(tables));

      expect(save).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      expect(emitted.at(-1)!.mergeConfig).toEqual(surMerge());
    });
  });
});

/**
 * The file step itself, as the wizard hosts it: the upload dialog opens for the missing file, and the
 * wizard hands each emitted connector back in, as manage-connector does.
 */
describe('ConnectorStepConfigComponent hosting the file step of a connector whose file is gone', () => {
  let fixture: ComponentFixture<ConnectorStepConfigComponent>;
  let emitted: ConnectorDTO[];
  let save: jasmine.Spy;
  let navigate: jasmine.Spy;

  beforeEach(async () => {
    save = jasmine.createSpy('save').and.returnValue(of({}));
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        provideRouter([]),
        {provide: ConnectorService, useValue: {save}},
        {provide: MatSnackBar, useValue: {open: jasmine.createSpy('open')}},
        {
          provide: ConnectorUploadService,
          useValue: {getFiles: () => of([]), getFileDetail: () => of(uploadedFile())},
        },
        {
          // The only dialog this step opens on its own is the upload dialog for the missing file.
          provide: MatDialog,
          useValue: {open: () => ({afterClosed: () => of({uploadedFile: uploadedFile(), settings: {}})})},
        },
      ],
    });
    TestBed.overrideComponent(ConnectorStepDataSourceInputFileConfigComponent, {
      remove: {imports: [RunNewFileComponent]},
      add: {schemas: [NO_ERRORS_SCHEMA]},
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(ConnectorStepConfigComponent);
    emitted = [];
    fixture.componentInstance.configChange.subscribe(config => {
      emitted.push(config);
      fixture.componentRef.setInput('config', config);
    });
    fixture.componentRef.setInput('cohortId', 8);
    fixture.componentRef.setInput('componentType', ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG);
    fixture.componentRef.setInput('config', savedConnectorWithoutFile());
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('takes the uploaded file of another structure without saving or reloading', () => {
    expect(emitted.at(-1)!.inputConfig).toEqual(jasmine.objectContaining({fileId: 31, fileExists: true}));
    expect(save).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('continues without the merge of the old tables', async () => {
    expect(fixture.componentInstance.onContinueClick()).toBeTrue();
    await fixture.whenStable();

    const config = emitted.at(-1)!;
    expect(config.mergeConfig).toBeUndefined();
    expect(Object.keys(config.fileInfo!)).toEqual(['patients', 'prescriptions']);
    expect(save).not.toHaveBeenCalled();
  });
});

function uploadedFile(): ConnectorFilesDetailDTO {
  return {
    id: 31,
    cohortId: 8,
    fileName: 'restructured.zip',
    uploadInfo: Object.values(restructuredTables()).map(({sheet, columns, json}) => ({sheet, columns, json})),
  } as unknown as ConnectorFilesDetailDTO;
}

function surMerge() {
  return {
    uidColumn: 'patient_id',
    commonUidColumnName: 'patient_id',
    sheetUidMapping: {SUR_medications: 'patient_id', SUR_socioeconomics: 'patient_id'},
  };
}

function savedConnectorWithoutFile(): ConnectorDTO {
  return {
    id: 2,
    cohortId: 8,
    inputConfig: {mode: 'FILE', fileType: 'CSV', delimiter: ',', hasHeader: true, firstSheetOnly: false, fileId: 13, fileExists: false},
    mergeConfig: surMerge(),
    schemaMapping: [
      {column: 'patient_id', mapping: 'Unique Patient ID'},
      {column: 'brand_name', mapping: 'Medication.Brand name'},
      {column: 'region', mapping: 'Meta.Region'},
    ],
  } as unknown as ConnectorDTO;
}

/** What the file step hands over once a file is uploaded: the new file and its tables. */
function withNewFile(fileInfo: Record<string, UploadInfoDTO>): ConnectorDTO {
  const connector = savedConnectorWithoutFile();
  return {
    ...connector,
    inputConfig: {...connector.inputConfig, fileId: 14, fileExists: true},
    fileInfo,
    uploadInfo: fileInfo,
  } as unknown as ConnectorDTO;
}

function surTables(): Record<string, UploadInfoDTO> {
  return {
    SUR_medications: table('SUR_medications', ['patient_id', 'start_date', 'brand_name']),
    SUR_socioeconomics: table('SUR_socioeconomics', ['patient_id', 'region', 'marital_status']),
  };
}

function restructuredTables(): Record<string, UploadInfoDTO> {
  return {
    patients: table('patients', ['PatientID', 'Gender', 'Region']),
    prescriptions: table('prescriptions', ['PatientID', 'Drug']),
  };
}

function table(sheet: string, columns: string[]): UploadInfoDTO {
  const row = Object.fromEntries(columns.map(column => [column, `${column}-1`]));
  return {
    sheet,
    json: JSON.stringify([row]),
    data: [row],
    columns,
    renamedColumns: [...columns],
    deletedColumns: columns.map(() => false),
  };
}

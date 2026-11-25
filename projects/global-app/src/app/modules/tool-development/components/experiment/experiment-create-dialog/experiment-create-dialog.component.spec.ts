import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSelectHarness} from '@angular/material/select/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {provideTranslateService} from '@ngx-translate/core';
import {of, Subject, throwError} from 'rxjs';
import {FileService} from '@shared-lib/modules/files/store/file.service';
import {FileDTO, UploadFileProgress} from '@shared-lib/modules/files/dto/file';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {ToolConfigDataType} from '@shared-lib/modules/app-execution/dto/config';
import {ExperimentService} from '../../../service/experiment-run.service';
import {ControllerSocketService} from '../../../service/testembed-socket.service';
import {TestRunDTO} from '../../../dto/test-run';
import {ExperimentCreateDialogComponent} from './experiment-create-dialog.component';

// Exercise the actual dialog, including template controls and the API payload.
describe('ExperimentCreateDialogComponent', () => {
  let component: ExperimentCreateDialogComponent;
  let fixture: ComponentFixture<ExperimentCreateDialogComponent>;
  let fileService: jasmine.SpyObj<FileService>;
  let experiments: jasmine.SpyObj<ExperimentService>;
  let socket: jasmine.SpyObj<ControllerSocketService>;
  let dialog: jasmine.SpyObj<MatDialogRef<ExperimentCreateDialogComponent>>;
  const storedFile = {
    id: 42, fileName: 'training.csv', contentType: 'text/csv', size: 100,
    downloadUrl: 'https://platform/files/42/', secret: 'secret/value',
  } as FileDTO;
  const result = {id: 101} as TestRunDTO;

  beforeEach(async () => {
    fileService = jasmine.createSpyObj('FileService', ['listFiles', 'upload']);
    fileService.listFiles.and.returnValue(of([storedFile]));
    experiments = jasmine.createSpyObj('ExperimentService', ['createExperiment']);
    experiments.createExperiment.and.returnValue(of(result));
    socket = jasmine.createSpyObj('ControllerSocketService', ['notifyStartExperiment']);
    dialog = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [ExperimentCreateDialogComponent],
      providers: [
        provideTranslateService(),
        {provide: FileService, useValue: fileService},
        {provide: ExperimentService, useValue: experiments},
        {provide: ControllerSocketService, useValue: socket},
        {provide: MatDialogRef, useValue: dialog},
        {provide: MAT_DIALOG_DATA, useValue: {
          app: {
            id: 7, name: 'Logistic regression', latestVersionId: 9,
            appConfig: {hyperparams: [], input: [
              {name: 'Training data', variableName: 'data', type: ToolConfigDataType.CSV, required: true},
              {name: 'Validation', variableName: 'validation', type: ToolConfigDataType.CSV, required: false},
            ], output: []},
          } as unknown as AppDetailDto,
          datafiles: ['iris.csv', 'validation.csv'],
        }},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ExperimentCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.experimentRunControl.setValue({name: 'Trial grid', description: 'Compare settings'});
  });

  it('offers My Files, uploads and engine paths for every experiment', async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const source = await loader.getHarness(MatSelectHarness.with({selector: '.experiment-input mat-select'}));
    await source.open();
    const options = await source.getOptions();
    expect(await Promise.all(options.map(option => option.getText())))
      .toEqual(['My Files', 'Upload new file', 'File on connected engine']);
    await options[2].click();
    expect(component.inputSources['data']).toBe('engine');
    expect(fixture.nativeElement.textContent).toContain('connected engine’s data directory');
  });

  it('requires mandatory inputs but allows optional inputs to be omitted', () => {
    component.onRunClick();
    expect(experiments.createExperiment).not.toHaveBeenCalled();
    component.getFormControl('data').setValue(storedFile);
    component.onRunClick();
    const payload = experiments.createExperiment.calls.mostRecent().args[1];
    expect(payload.inputFilePaths).toEqual({});
    expect(JSON.parse(payload.inputData!)).toEqual({data: 'https://platform/files/42/download?secret=secret%2Fvalue'});
    expect(socket.notifyStartExperiment).toHaveBeenCalledTimes(1);
    expect(dialog.close).toHaveBeenCalledWith(result);
  });

  it('sends mixed stored files and engine paths under the configured variable names', () => {
    component.getFormControl('data').setValue(storedFile);
    component.setSource('validation', 'engine');
    component.getFormControl('validation').setValue(' validation.csv ');
    component.onMultiHyperParamsChanged({C: [0.1, 1]});
    component.onRunClick();
    const payload = experiments.createExperiment.calls.mostRecent().args[1];
    expect(payload.inputFilePaths).toEqual({validation: 'validation.csv'});
    expect(payload.hyperParams).toEqual({C: [0.1, 1]});
    expect(Object.keys(JSON.parse(payload.inputData!))).toEqual(['data']);
  });

  it('clears the previous choice when switching sources', () => {
    component.getFormControl('data').setValue(storedFile);
    component.setSource('data', 'engine');
    expect(component.isValid()).toBeFalse();
    component.getFormControl('data').setValue('iris.csv');
    component.onRunClick();
    const payload = experiments.createExperiment.calls.mostRecent().args[1];
    expect(payload.inputFilePaths).toEqual({data: 'iris.csv'});
    expect(JSON.parse(payload.inputData!)).toEqual({});
  });

  it('uploads into My Files, blocks starting during transfer and selects the returned file', () => {
    const upload = new Subject<UploadFileProgress>();
    fileService.upload.and.returnValue(upload);
    component.setSource('data', 'upload');
    const file = new File(['x,y\n1,2'], 'new.csv', {type: 'text/csv'});
    component.uploadFile('data', {target: {files: [file], value: 'new.csv'}} as unknown as Event);
    component.onRunClick();
    expect(experiments.createExperiment).not.toHaveBeenCalled();
    expect(fileService.upload).toHaveBeenCalledWith(file);
    const uploaded = {...storedFile, id: 43, fileName: 'new.csv', downloadUrl: 'https://platform/files/43'};
    upload.next({progress: 100, inProgress: false, result: uploaded});
    upload.complete();
    expect(component.selectedFile('data')).toEqual(uploaded);
    expect(component.files()).toContain(uploaded);
    component.onRunClick();
    expect(JSON.parse(experiments.createExperiment.calls.mostRecent().args[1].inputData!))
      .toEqual({data: 'https://platform/files/43/download?secret=secret%2Fvalue'});
  });

  it('keeps upload failures visible and allows a retry', () => {
    fileService.upload.and.returnValue(throwError(() => new Error('offline')));
    component.setSource('data', 'upload');
    component.uploadFile('data', {target: {files: [new File(['x'], 'data.csv')], value: ''}} as unknown as Event);
    fixture.detectChanges();
    expect(component.isValid()).toBeFalse();
    expect(component.uploads()['data'].inProgress).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Upload failed. Please try again.');
  });

  it('allows engine files when My Files cannot be loaded', () => {
    fileService.listFiles.and.returnValue(throwError(() => new Error('offline')));
    component.loadFiles();
    expect(component.fileListError()).toBeTrue();
    component.setSource('data', 'engine');
    component.getFormControl('data').setValue('iris.csv');
    expect(component.isValid()).toBeTrue();
  });

  it('does not submit invalid hyperparameters or duplicate pending requests', () => {
    component.getFormControl('data').setValue(storedFile);
    component.onFormsValid(false);
    component.onRunClick();
    expect(experiments.createExperiment).not.toHaveBeenCalled();
    component.onFormsValid(true);
    const request = new Subject<TestRunDTO>();
    experiments.createExperiment.and.returnValue(request);
    component.onRunClick();
    component.onRunClick();
    expect(experiments.createExperiment).toHaveBeenCalledTimes(1);
    request.complete();
    expect(component.starting()).toBeFalse();
  });
});

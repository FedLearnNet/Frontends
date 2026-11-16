import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatAutocompleteHarness} from '@angular/material/autocomplete/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {provideTranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {FileService} from '@shared-lib/modules/files/store/file.service';
import {ToolConfigDataType} from '@shared-lib/modules/app-execution/dto/config';
import {FLNetParticipantRole} from '../../../../dto/federated-test-run';
import {AppRunFederatedTestConfigDialogComponent} from './app-run-federated-test-config-dialog.component';

for (const builtImage of [false, true]) describe(`${builtImage ? 'Built' : 'Local'} federated participant data`, () => {
  const file = {id: 42, fileName: 'training.csv', downloadUrl: 'http://platform/files/42/', secret: 'secret/value'};
  let component: AppRunFederatedTestConfigDialogComponent;
  let close: jasmine.Spy;
  let files: jasmine.SpyObj<FileService>;
  let loader: ReturnType<typeof TestbedHarnessEnvironment.loader>;

  beforeEach(async () => {
    close = jasmine.createSpy('close');
    files = jasmine.createSpyObj('FileService', ['listFiles', 'upload']);
    files.listFiles.and.returnValue(of([file] as any));
    files.upload.and.returnValue(of({progress: 100, inProgress: false, result: file} as any));
    await TestBed.configureTestingModule({
      imports: [AppRunFederatedTestConfigDialogComponent],
      providers: [provideTranslateService(), {provide: FileService, useValue: files},
        {provide: MatDialogRef, useValue: {close}}, {provide: MAT_DIALOG_DATA, useValue: {
          builtImage, datafiles: ['local.csv'], value: {participantId: 'client-1', role: FLNetParticipantRole.CLIENT},
          app: {appConfig: {input: [{name: 'data', required: true, type: ToolConfigDataType.CSV}], output: [], hyperparams: []}},
        }}],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppRunFederatedTestConfigDialogComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
    component['hyperParamsValid'] = true;
    expect(fixture.nativeElement.textContent).toContain('Upload file');
  });

  it('offers uploaded files in the data selector', async () => {
    expect(files.listFiles).toHaveBeenCalled();
    if (builtImage) {
      const select = await loader.getHarness(MatSelectHarness.with({selector: 'mat-select:not([formControlName])'}));
      await select.open();
      await select.clickOptions({text: 'training.csv'});
    } else {
      const autocomplete = await loader.getHarness(MatAutocompleteHarness);
      await autocomplete.focus();
      await autocomplete.selectOption({text: 'training.csv'});
      expect(await autocomplete.getValue()).toBe('training.csv');
    }
    expect(await (await loader.getHarness(MatButtonHarness.with({text: 'Save changes'}))).isDisabled()).toBeFalse();
    component['save']();
    expect(close.calls.mostRecent().args[0].inputFilePaths.data).toBe(component['fileUrl'](file as any));
  });

  if (!builtImage) it('still accepts paths in the local engine directory', () => {
    component['getDataControl']('data').setValue('local.csv');
    component['save']();
    expect(close.calls.mostRecent().args[0].inputFilePaths).toEqual({data: 'local.csv'});
  });

  it('keeps a selected store file as an encoded download link', () => {
    component['getDataControl']('data').setValue(component['fileUrl'](file as any));
    component['save']();
    expect(close.calls.mostRecent().args[0].inputFilePaths)
      .toEqual({data: 'http://platform/files/42/download?secret=secret%2Fvalue'});
  });

  it('uploads a new file and selects it for this participant', () => {
    const uploaded = new File(['x\n1'], 'training.csv', {type: 'text/csv'});
    component['uploadFile']('data', {target: {files: [uploaded], value: ''}} as unknown as Event);
    expect(files.upload).toHaveBeenCalledWith(uploaded);
    component['save']();
    expect(close.calls.mostRecent().args[0].inputFilePaths.data).toContain('/files/42/download?secret=');
  });

  it('requires client inputs but allows a data-free aggregator', () => {
    component['save']();
    expect(close).not.toHaveBeenCalled();
    component['form'].controls.role.setValue(FLNetParticipantRole.AGGREGATOR);
    component['save']();
    expect(close).toHaveBeenCalled();
  });
});

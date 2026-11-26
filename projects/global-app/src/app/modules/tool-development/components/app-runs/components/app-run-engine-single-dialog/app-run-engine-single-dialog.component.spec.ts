import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {provideTranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {FileService} from '@shared-lib/modules/files/store/file.service';
import {AppRunEngineSingleDialogComponent} from './app-run-engine-single-dialog.component';
import {TestEngineService} from '../../../../service/test-engine.service';
import {TestEngineMode} from '../../../../dto/test-engine';

describe('Central run container', () => {
  it('starts only when Run is clicked and includes the selected file and parameters', async () => {
    const start = jasmine.createSpy('start').and.returnValue(of({id: 99}));
    await TestBed.configureTestingModule({
      imports: [AppRunEngineSingleDialogComponent], providers: [provideTranslateService(),
        {provide: FileService, useValue: {listFiles: () => of([])}},
        {provide: TestEngineService, useValue: {start}}, {provide: Store, useValue: {dispatch: () => {}}},
        {provide: MatDialogRef, useValue: {close: () => {}}}, {provide: MAT_DIALOG_DATA, useValue: {
          app: {id: 28, latestVersionId: 4, appConfig: {input: [], hyperparams: []}},
        }}],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppRunEngineSingleDialogComponent);
    fixture.detectChanges();
    expect(start).not.toHaveBeenCalled();
    const component = fixture.componentInstance;
    component.selected.set({data: {downloadUrl: 'http://platform/files/1/', secret: 'test/value'} as any});
    component.hyperParams.set({epochs: 2});
    component.start();
    expect(start).toHaveBeenCalledWith(28, {mode: TestEngineMode.SINGLE_RUN, testRun: {
      federatedAppVersionId: 4, hyperParams: {epochs: 2},
      inputs: {data: 'http://platform/files/1/download?secret=test%2Fvalue'},
    }});
  });
});

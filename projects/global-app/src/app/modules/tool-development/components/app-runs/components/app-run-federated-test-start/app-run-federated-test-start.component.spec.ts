import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {provideTranslateService} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {of} from 'rxjs';
import {TestEngineService} from '../../../../service/test-engine.service';
import {ControllerSocketService} from '../../../../service/testembed-socket.service';
import {TestEngineMode} from '../../../../dto/test-engine';
import {FLNetParticipantRole} from '../../../../dto/federated-test-run';
import {AppRunFederatedTestStartComponent} from './app-run-federated-test-start.component';
import {AppRunFederatedTestComponent} from '../app-run-federated-test/app-run-federated-test.component';
import {FederatedRunService} from '../../../../service/federated-run.service';
import {Router} from '@angular/router';

describe('Built federated test experiment', () => {
  for (const count of [2, 4]) for (const colocated of [false, true]) it(`starts ${count} clients with ${colocated ? 'a client-hosted' : 'a separate'} aggregator`, async () => {
    const start = jasmine.createSpy('start').and.returnValue(of({id: 99}));
    const close = jasmine.createSpy('close');
    const socket = jasmine.createSpyObj('socket', ['runFederatedTest']);
    await TestBed.configureTestingModule({
      imports: [AppRunFederatedTestStartComponent],
      providers: [provideTranslateService(), {provide: TestEngineService, useValue: {start}},
        {provide: Store, useValue: {dispatch: jasmine.createSpy('dispatch')}},
        {provide: ControllerSocketService, useValue: socket}, {provide: MatDialog, useValue: {}},
        {provide: MatDialogRef, useValue: {close}}, {provide: MAT_DIALOG_DATA, useValue: {
          builtImage: true, datafiles: [], app: {id: 28, latestVersionId: 4,
            appConfig: {input: [{name: 'data', required: true}]}},
        }}],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppRunFederatedTestStartComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component['setClientCount'](count);
    expect(component['clients']().length).toBe(count);
    expect(start).not.toHaveBeenCalled();
    expect(component['isValid']()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Choose the required training data for each client');
    component['participants'].update(participants => participants.map(p => p.role === FLNetParticipantRole.CLIENT
      ? {...p, inputFilePaths: {data: `http://platform/files/${p.participantId}/download?secret=test`}} : p));
    component['aggregatorParticipantId'] = colocated ? 'client-1' : '';
    expect(component['readyClients']()).toBe(count);
    expect(component['effectiveParticipants']().length).toBe(count + (colocated ? 0 : 1));
    component['onRunClick']();
    expect(start.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({mode: TestEngineMode.FEDERATED_RUN,
      federatedTestRun: jasmine.objectContaining({config: {pollInterval: 0.25, timeout: 600, maxPolls: 2400},
        participants: jasmine.arrayContaining([jasmine.objectContaining({participantId: 'client-1',
          inputFilePaths: {data: 'http://platform/files/client-1/download?secret=test'}})])})}));
    expect(socket.runFederatedTest).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledWith(true);
    const participants = start.calls.mostRecent().args[1].federatedTestRun.participants;
    expect(participants.length).toBe(count + (colocated ? 0 : 1));
    expect(start.calls.mostRecent().args[1].federatedTestRun.aggregatorParticipantId).toBe(colocated ? 'client-1' : undefined);
    const aggregator = participants.find((p: any) => p.role === FLNetParticipantRole.AGGREGATOR);
    expect(aggregator.participantId).toBe(colocated ? 'client-1' : 'aggregator');
    expect(!!aggregator.inputFilePaths).toBe(colocated);
  });
});

describe('Federated tests without a prestarted engine', () => {
  it('opens orchestrated participant setup when only the built image is available', async () => {
    const open = jasmine.createSpy('open').and.returnValue({afterClosed: () => of(undefined)});
    await TestBed.configureTestingModule({
      imports: [AppRunFederatedTestComponent],
      providers: [provideTranslateService(), {provide: MatDialog, useValue: {open}},
        {provide: FederatedRunService, useValue: {getRuns: () => of([])}},
        {provide: ControllerSocketService, useValue: {getFederatedRunUpdate$: () => of()}},
        {provide: Router, useValue: {}}],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppRunFederatedTestComponent);
    fixture.componentRef.setInput('app', {id: 28, hasImage: true});
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('lib-action-card-button button');
    expect(button.disabled).toBeFalse();
    button.click();
    expect(open).toHaveBeenCalledWith(AppRunFederatedTestStartComponent,
      jasmine.objectContaining({data: {app: jasmine.objectContaining({id: 28}), builtImage: true, datafiles: []}}));
    const connected = fixture.nativeElement.querySelectorAll('lib-action-card-button button')[1];
    expect(connected.disabled).toBeTrue();
    fixture.componentRef.setInput('appRunning', true);
    fixture.componentRef.setInput('datafiles', ['local.csv']);
    fixture.detectChanges();
    expect(connected.disabled).toBeFalse();
    connected.click();
    expect(open.calls.mostRecent().args[1].data).toEqual({app: jasmine.objectContaining({id: 28}), builtImage: false, datafiles: ['local.csv']});
  });
});

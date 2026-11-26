import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {provideTranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';
import {AppRunTestComponent} from './app-run-test.component';
import {AppRunTestStartComponent} from '../app-run-test-start/app-run-test-start.component';
import {AppRunEngineSingleDialogComponent} from '../app-run-engine-single-dialog/app-run-engine-single-dialog.component';
import {TestRunService} from '../../../../service/test-run.service';
import {ControllerSocketService} from '../../../../service/testembed-socket.service';

describe('Central test execution choice', () => {
  it('offers an independent run container alongside a connected engine', async () => {
    const open = jasmine.createSpy('open').and.returnValue({afterClosed: () => of(undefined)});
    await TestBed.configureTestingModule({
      imports: [AppRunTestComponent], providers: [provideTranslateService(),
        {provide: MatDialog, useValue: {open}}, {provide: TestRunService, useValue: {getRuns: () => of([])}},
        {provide: ControllerSocketService, useValue: {getRunUpdate$: () => of()}}],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppRunTestComponent);
    fixture.componentRef.setInput('app', {id: 28, hasImage: true});
    fixture.componentRef.setInput('datafiles', ['local.csv']);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('lib-action-card-button button');
    expect(buttons[0].disabled).toBeFalse();
    expect(buttons[1].disabled).toBeTrue();
    buttons[0].click();
    expect(open.calls.mostRecent().args[0]).toBe(AppRunEngineSingleDialogComponent);
    fixture.componentRef.setInput('appRunning', true);
    fixture.detectChanges();
    expect(buttons[0].disabled).toBeFalse();
    expect(buttons[1].disabled).toBeFalse();
    buttons[1].click();
    expect(open.calls.mostRecent().args[0]).toBe(AppRunTestStartComponent);
    expect(open.calls.mostRecent().args[1].data.datafiles).toEqual(['local.csv']);
  });
});

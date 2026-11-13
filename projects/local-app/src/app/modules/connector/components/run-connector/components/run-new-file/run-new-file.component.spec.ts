import {Component, NO_ERRORS_SCHEMA, Pipe, PipeTransform, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MATERIAL_ANIMATIONS} from '@angular/material/core';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {RunNewFileComponent} from './run-new-file.component';
import {ConnectorDTO} from '../../../../dto/connector';

@Pipe({name: 'translate'})
class TranslateStubPipe implements PipeTransform {
  transform(key: string): string {
    return key;
  }
}

/** Hands the connector down the way the wizard's file step does: a new object on every change. */
@Component({
  template: `@if (shown()) {
    <app-run-new-file [config]="config()"/>
  }`,
  imports: [RunNewFileComponent],
})
class FileStepHostComponent {
  static fileExistsAtStart = false;
  readonly config = signal<ConnectorDTO>(connector(FileStepHostComponent.fileExistsAtStart));
  readonly shown = signal(true);
}

describe('RunNewFileComponent', () => {
  let fixture: ComponentFixture<FileStepHostComponent>;
  let dialog: MatDialog;

  async function render(fileExists: boolean): Promise<void> {
    FileStepHostComponent.fileExistsAtStart = fileExists;
    fixture = TestBed.createComponent(FileStepHostComponent);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FileStepHostComponent],
      providers: [
        {provide: TranslateService, useValue: {instant: (key: string) => key}},
        // A closing dialog stays open until its exit animation ends; without animations it ends at once.
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
      ],
    });
    TestBed.overrideComponent(RunNewFileComponent, {
      set: {imports: [TranslateStubPipe], schemas: [NO_ERRORS_SCHEMA]},
    });
    dialog = TestBed.inject(MatDialog);
  });

  afterEach(() => dialog.closeAll());

  it('does not ask for a file the connector has', async () => {
    await render(true);

    expect(dialog.openDialogs.length).toBe(0);
  });

  it('asks for the missing file when it is shown a connector without one', async () => {
    await render(false);

    expect(dialog.openDialogs.length).toBe(1);
  });

  // The wizard hands the step a new connector object whenever anything about it changes. Each one
  // opened another "file missing" dialog on top of the last, so uploading through the top one left
  // the others on screen.
  it('asks only once, however often the connector is handed down again', async () => {
    await render(false);
    fixture.componentInstance.config.set(connector(false));
    await fixture.whenStable();
    fixture.componentInstance.config.set(connector(false));
    await fixture.whenStable();

    expect(dialog.openDialogs.length).toBe(1);
  });

  it('puts the question away once the connector has its file again', async () => {
    await render(false);
    fixture.componentInstance.config.set(connector(true));
    await fixture.whenStable();

    expect(dialog.openDialogs.length).toBe(0);
  });

  // The wizard rebuilds its steps after the upload is saved; a dialog left behind would answer to a
  // step that no longer exists.
  it('puts the question away when the step is left', async () => {
    await render(false);
    fixture.componentInstance.shown.set(false);
    await fixture.whenStable();

    expect(dialog.openDialogs.length).toBe(0);
  });
});

function connector(fileExists: boolean): ConnectorDTO {
  return {
    id: 3,
    cohortId: 6,
    inputConfig: {mode: 'FILE', fileType: 'CSV', fileId: 11, fileExists},
  } as unknown as ConnectorDTO;
}

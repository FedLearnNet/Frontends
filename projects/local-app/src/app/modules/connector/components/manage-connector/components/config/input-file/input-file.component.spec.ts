import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {provideRouter} from '@angular/router';
import {provideTranslateService} from '@ngx-translate/core';
import {of, Subject} from 'rxjs';
import {ConnectorStepDataSourceInputFileConfigComponent} from './input-file.component';
import {InputFileUploadDialogComponent} from './components/input-file-upload-dialog/input-file-upload-dialog.component';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {InputFileSelectDialogComponent} from './components/input-file-select-dialog/input-file-select-dialog.component';
import {RunNewFileComponent} from '../../../../run-connector/components/run-new-file/run-new-file.component';
import {ConnectorUploadService} from '../../../../../services/connector-upload.service';
import {ConnectorDTO} from '../../../../../dto/connector';
import {ConnectorFilesDetailDTO, ConnectorFilesDTO} from '../../../../../dto/upload-info';

/**
 * The file step of an existing connector whose source file was deleted after a successful run.
 *
 * <p>The connector still points at the deleted file, so the step used to look as if the file were
 * there: the deleted file's parsing settings, a "replace the file" checkbox instead of the upload
 * actions, and a Continue that led on to the old columns.</p>
 */
describe('ConnectorStepDataSourceInputFileConfigComponent', () => {
  let fixture: ComponentFixture<ConnectorStepDataSourceInputFileConfigComponent>;
  let component: ConnectorStepDataSourceInputFileConfigComponent;
  let openedDialogs: unknown[];
  let librarySelection: ConnectorFilesDTO | undefined;
  let confirmed: boolean;

  async function render(fileExists: boolean): Promise<void> {
    openedDialogs = [];
    librarySelection = undefined;
    confirmed = true;
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        provideRouter([]),
        {
          provide: ConnectorUploadService,
          useValue: {getFiles: () => of([libraryFile()]), getFileDetail: () => of(libraryFileDetail())},
        },
        {
          provide: MatDialog,
          useValue: {
            open: (dialogComponent: unknown) => {
              openedDialogs.push(dialogComponent);
              const result = dialogComponent === InputFileSelectDialogComponent && librarySelection
                ? of(librarySelection)
                : dialogComponent === ConfirmDialogComponent
                  ? of(confirmed)
                  : new Subject<unknown>().asObservable();
              return {afterClosed: () => result};
            },
          },
        },
      ],
    });
    // Replacing a file is the run dialog's component; this step only decides whether to show it.
    TestBed.overrideComponent(ConnectorStepDataSourceInputFileConfigComponent, {
      remove: {imports: [RunNewFileComponent]},
      add: {schemas: [NO_ERRORS_SCHEMA]},
    });
    fixture = TestBed.createComponent(ConnectorStepDataSourceInputFileConfigComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', connector(fileExists));
    fixture.componentRef.setInput('cohortId', 6);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  }

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function query(selector: string): Element | null {
    return (fixture.nativeElement as HTMLElement).querySelector(selector);
  }

  describe('when the connector\'s file was deleted', () => {
    beforeEach(async () => render(false));

    it('says the file is missing', () => {
      expect(query('lib-info-card')).not.toBeNull();
      expect(text()).toContain('CONNECTOR_FILE_MISSING.TITLE');
      // The badge capitalises its text for display.
      expect(text().toLowerCase()).toContain('connector_file_missing.badge');
    });

    it('offers the upload actions of a connector without a file', () => {
      expect(text()).toContain('MAIN_IMPORT');
      expect(query('app-run-new-file')).toBeNull();
    });

    it('asks for the new file straight away', () => {
      expect(openedDialogs).toEqual([InputFileUploadDialogComponent]);
    });

    it('does not show the deleted file\'s parsing settings', () => {
      expect(query('.file-parsing-summary')).toBeNull();
    });

    it('does not continue to the next step', () => {
      expect(component.onContinueClick()).toBeFalse();
    });

    // A saved connector checks whether it can read the chosen file as it is set up, which needs the
    // file's tables; an upload hands them over too.
    it('hands over the tables of a file chosen from the library', () => {
      const emitted: ConnectorDTO[] = [];
      component.configChange.subscribe(config => emitted.push(config));
      librarySelection = libraryFile();

      component.openFileSelectionDialog();

      const config = emitted.at(-1)!;
      expect(config.inputConfig).toEqual(jasmine.objectContaining({fileId: 21, fileExists: true}));
      expect(Object.keys(config.fileInfo!)).toEqual(['patients', 'prescriptions']);
      expect(config.fileInfo!['patients'].columns).toEqual(['PatientID', 'Gender']);
    });

    // The new file has two tables the connector never merged, so using it discards the setup.
    it('asks before using a file whose structure differs, and uses it once confirmed', () => {
      const emitted: ConnectorDTO[] = [];
      component.configChange.subscribe(config => emitted.push(config));
      librarySelection = libraryFile();

      component.openFileSelectionDialog();

      expect(openedDialogs).toContain(ConfirmDialogComponent);
      expect(emitted.at(-1)!.inputConfig).toEqual(jasmine.objectContaining({fileId: 21}));
    });

    it('keeps the missing file when the user declines the other structure', () => {
      const emitted: ConnectorDTO[] = [];
      component.configChange.subscribe(config => emitted.push(config));
      librarySelection = libraryFile();
      confirmed = false;

      component.openFileSelectionDialog();

      expect(openedDialogs).toContain(ConfirmDialogComponent);
      expect(emitted).toEqual([]);
      expect(component.hasNoFileUploaded()).toBeTrue();
    });
  });

  describe('when the connector has its file', () => {
    beforeEach(async () => render(true));

    it('keeps the option to replace it', () => {
      expect(query('app-run-new-file')).not.toBeNull();
      expect(query('lib-info-card')).toBeNull();
      expect(openedDialogs).toEqual([]);
    });

    it('shows the file\'s parsing settings', () => {
      expect(query('.file-parsing-summary')).not.toBeNull();
    });

    it('continues to the next step', () => {
      expect(component.onContinueClick()).toBeTrue();
    });
  });
});

function connector(fileExists: boolean): ConnectorDTO {
  return {
    id: 3,
    cohortId: 6,
    inputConfig: {mode: 'FILE', fileType: 'CSV', delimiter: ',', hasHeader: true, fileId: 13, fileExists},
  } as unknown as ConnectorDTO;
}

function libraryFile(): ConnectorFilesDTO {
  return {id: 21, cohortId: 6, fileName: 'restructured.zip'} as ConnectorFilesDTO;
}

function libraryFileDetail(): ConnectorFilesDetailDTO {
  return {
    ...libraryFile(),
    uploadInfo: [
      {sheet: 'patients', columns: ['PatientID', 'Gender'], json: '[{"PatientID":"1","Gender":"f"}]'},
      {sheet: 'prescriptions', columns: ['PatientID', 'Drug'], json: '[{"PatientID":"1","Drug":"x"}]'},
    ],
  } as unknown as ConnectorFilesDetailDTO;
}

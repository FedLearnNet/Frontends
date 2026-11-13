import {NO_ERRORS_SCHEMA, Pipe, PipeTransform, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of, Subject} from 'rxjs';
import {ManageConnectorComponent} from './manage-connector.component';
import {ConnectorStepConfigs} from '../../enum/connector-step-config';
import {ConnectorManagementMode} from '../../enum/connector-managment-mode';
import {ConnectorCard} from '../../models/connector-card';
import {ConnectorDTO} from '../../dto/connector';
import {ConnectorFilesDetailDTO} from '../../dto/upload-info';
import {FunctionService} from '../../services/function.service';
import {ConnectorPreviewService} from '../../services/connector-preview.service';
import {ConnectorService} from '../../services/connector-crud.service';
import {ConnectorUploadService} from '../../services/connector-upload.service';

@Pipe({name: 'translate'})
class TranslateStubPipe implements PipeTransform {
  transform(key: string): string {
    return key;
  }
}

describe('ManageConnectorComponent', () => {
  const cohortId = 7;
  const storageKey = 'connectorConfig' + cohortId;

  let fixture: ComponentFixture<ManageConnectorComponent>;
  let component: ManageConnectorComponent;
  let dialogs: Subject<unknown>[];
  let fileDetailResponse: Subject<ConnectorFilesDetailDTO>;
  let preview: jasmine.Spy;
  let snackBarOpen: jasmine.Spy;

  afterEach(() => localStorage.removeItem(storageKey));

  describe('editing a saved connector', () => {
    it('opens on the mapper, the last step', async () => {
      await render(ConnectorManagementMode.EDIT, {...fileConnector(), id: 3, transformer: []});

      expect(fixture.nativeElement.querySelector('app-edit-mapper')).not.toBeNull();
      expect(component.currentStep().type).toBe('MAPPING');
    });

    // The connector still points at the file a successful run deleted, which made the file step
    // look done (a tick and the deleted file's type) although a new file is needed.
    it('marks the file step as missing its file when the file was deleted', async () => {
      const connector = fileConnector();
      await render(ConnectorManagementMode.EDIT, {
        ...connector,
        id: 3,
        transformer: [],
        inputConfig: {...connector.inputConfig, fileExists: false},
      } as ConnectorDTO);

      const fileCard = component.configCards()[1];
      expect(fileCard.configured).toBeFalse();
      expect(fileCard.content).toBe('CONNECTOR_FILE_MISSING.BADGE');
    });

    // The preview returns the source table when there is no step, and it was matched to a
    // transform card that does not exist ("Transformation error" in the console).
    it('requests no transform preview when the connector has no transform step', async () => {
      const consoleError = spyOn(console, 'error');

      await render(ConnectorManagementMode.EDIT, {...fileConnector(), id: 3, transformer: []});

      expect(preview).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('still previews the transform steps the connector has', async () => {
      await render(ConnectorManagementMode.EDIT, {
        ...fileConnector(),
        id: 3,
        transformer: [{moduleName: 'tools', methodName: 'strip', column: 'patient_id', parameters: []}],
      } as unknown as ConnectorDTO);

      expect(preview).toHaveBeenCalledTimes(1);
    });

    // The TranslateService stub returns the key, so translated text shows up as its key.
    // The connector's file was replaced by one with other tables, so the resolver dropped the merge
    // of the old ones. Mapping needs one table, and the mapper would show only the first.
    it('opens on Specify Headers when the file has tables nothing merges', async () => {
      await render(ConnectorManagementMode.EDIT, {
        ...fileConnector(),
        id: 3,
        transformer: [],
        fileInfo: {
          patients: {sheet: 'patients', columns: ['PatientID'], json: '[{"PatientID":"1"}]', fileExists: true},
          prescriptions: {sheet: 'prescriptions', columns: ['PatientID'], json: '[{"PatientID":"1"}]', fileExists: true},
        },
      } as unknown as ConnectorDTO);

      expect(component.currentStep().step).toBe(ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
      expect(contentStep()).toBe(ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
      expect(fixture.nativeElement.querySelector('app-edit-mapper')).toBeNull();
      expect(snackBarOpen).toHaveBeenCalledTimes(1);
      expect(snackBarOpen.calls.mostRecent().args[0]).toBe('CONNECTOR_FILE_STRUCTURE_CHANGED');
    });

    it('opens on the mapper when the merge joins the tables', async () => {
      await render(ConnectorManagementMode.EDIT, {
        ...fileConnector(),
        id: 3,
        transformer: [],
        mergeConfig: {uidColumn: 'PatientID', commonUidColumnName: 'PatientID', sheetUidMapping: {a: 'PatientID', b: 'PatientID'}},
      } as unknown as ConnectorDTO);

      expect(component.currentStep().type).toBe('MAPPING');
      expect(snackBarOpen).not.toHaveBeenCalled();
    });

    it('labels the mapper and file steps with translated text', async () => {
      await render(ConnectorManagementMode.EDIT, {...fileConnector(), id: 3, transformer: []});

      const mapperCard = component.mappingCards()[0];
      expect(mapperCard.title).toBe('MAPPER');
      expect(mapperCard.content).toBe('MAP_TO_SCHEMA');
      expect(component.configCards()[1].content).toBe('FILE_TYPE: CSV');
    });
  });

  describe('wizard steps', () => {
    const sourceCard: ConnectorCard = {
      index: 0,
      title: 'Source',
      step: ConnectorStepConfigs.STEP_SOURCE_CONFIG,
      type: 'CONFIG',
    };
    const fileCard: ConnectorCard = {
      index: 1,
      title: 'File Import Settings',
      step: ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG,
      type: 'CONFIG',
    };

    beforeEach(async () => {
      await render(ConnectorManagementMode.NEW);
    });

    it('adds the specify-header step when uploaded file info becomes available', () => {
      component.cards.set([sourceCard, fileCard]);
      component.config.set(configWithFileInfo());

      expect(component.canShowDownstreamSteps()).toBeFalse();

      (component as any).syncCardState();

      const cards = component.cards();
      expect(cards[2].step).toBe(ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
      expect(cards[2].title.trim()).toBe('SPECIFY_HEADER');
      expect(component.canShowDownstreamSteps()).toBeTrue();
    });

    it('inserts the specify-header step before an existing transformer', () => {
      const transformerCard: ConnectorCard = {
        index: 2,
        id: 'transform-1',
        title: 'Transformer',
        step: ConnectorStepConfigs.TRANSFORM,
        type: 'TRANSFORM',
      };
      component.cards.set([sourceCard, fileCard, transformerCard]);
      component.config.set(configWithFileInfo());

      (component as any).syncCardState();

      const cards = component.cards();
      expect(cards.map(card => card.step)).toEqual([
        ConnectorStepConfigs.STEP_SOURCE_CONFIG,
        ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG,
        ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
        ConnectorStepConfigs.TRANSFORM,
      ]);
      expect(cards[3].id).toBe(transformerCard.id);
      expect(cards.map(card => card.index)).toEqual([0, 1, 2, 3]);
    });

    it('keeps the selected step on its card when the steps are renumbered', () => {
      const transformerCard: ConnectorCard = {
        index: 2,
        id: 'transform-1',
        title: 'Transformer',
        step: ConnectorStepConfigs.TRANSFORM,
        type: 'TRANSFORM',
      };
      component.cards.set([sourceCard, fileCard, transformerCard]);
      component.config.set(configWithFileInfo());
      component.onCardClick(transformerCard);

      (component as any).syncCardState();

      expect(component.currentStep().id).toBe('transform-1');
      expect(component.currentStep().index).toBe(3);
    });

  it('gives the mapper the Specify Headers columns with the merge UID column first', () => {
    component.config.set({
      mergeConfig: {uidColumn: 'patient_id', sheetUidMapping: {}, commonUidColumnName: 'Patient ID'},
      fileInfo: {
        Merged: {
          columns: ['age', 'Patient ID', 'weight'],
          renamedColumns: ['age', 'Patient ID', 'weight'],
          deletedColumns: [false, false, false],
          json: '[]',
        },
      },
    } as unknown as ConnectorDTO);
    component.transformedData.set(new Map());

    expect(component.getMapperColumns()).toEqual(['Patient ID', 'age', 'weight']);
  });

  it('takes the transformed columns in the order the preview sent, also for number-like names', () => {
    const step = {index: component.cards().length, title: 'step', configured: true, optional: true,
      step: ConnectorStepConfigs.TRANSFORM, type: 'TRANSFORM', id: 't1', previewRunning: false} as ConnectorCard;
    component.config.set({} as ConnectorDTO);
    component.cards.set([...component.cards(), step]);
    component.currentStep.set(step);
    // A parsed row lists "2019" first; the preview's column list keeps the real order.
    component.transformedData.set(new Map([['t1', [{patient_id: 'p1', '2019': 5, bmi: 22}]]]));
    component.transformedColumns.set(new Map([['t1', ['patient_id', '2019', 'bmi']]]));

    expect(component.getLatestColumns()).toEqual(['patient_id', '2019', 'bmi']);
    expect(component.getCurrentStepColumns()).toEqual(['patient_id', '2019', 'bmi']);
  });

    function configWithFileInfo(): ConnectorDTO {
      return {
        inputConfig: {
          mode: 'FILE',
          fileType: 'CSV',
          fileId: 42,
        },
        fileInfo: {
          '0': {
            sheet: '0',
            columns: ['patient_id'],
            renamedColumns: ['patient_id'],
            deletedColumns: [false],
            json: [{patient_id: '1'}],
          },
        },
      } as unknown as ConnectorDTO;
    }
  });

  // The app is zoneless. These tests change the wizard the way the app does: from a dialog's
  // afterClosed, an HTTP response or a timer, none of which schedules change detection by itself.
  // The drawer and the step content have to update without any manual refresh.
  describe('rendering after async updates', () => {
    const allDownstreamSteps = [
      ConnectorStepConfigs.STEP_SOURCE_CONFIG,
      ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG,
      ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
      ConnectorStepConfigs.TRANSFORM,
      ConnectorStepConfigs.MAPPER,
    ];

    it('shows the restored steps when the user continues a cached draft', async () => {
      localStorage.setItem(storageKey, JSON.stringify(fileConnector()));
      await render(ConnectorManagementMode.NEW);
      expect(drawerSteps()).toEqual([ConnectorStepConfigs.STEP_SOURCE_CONFIG]);
      expect(dialogs.length).toBe(1);

      dialogs[0].next(true);
      await fixture.whenStable();

      expect(drawerSteps()).toEqual(allDownstreamSteps);
      expect(contentStep()).toBe(ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
    });

    it('shows the downstream steps once file info for the connector arrives', async () => {
      await render(ConnectorManagementMode.EDIT, {...fileConnector(), id: 3, fileInfo: undefined});
      expect(drawerSteps()).toEqual(allDownstreamSteps.slice(0, 3));

      fileDetailResponse.next(fileDetail());
      await fixture.whenStable();

      expect(drawerSteps()).toEqual(allDownstreamSteps);
    });

    it('opens the file step when the connector file is missing', async () => {
      const connector = fileConnector();
      await render(ConnectorManagementMode.EDIT, {
        ...connector,
        id: 3,
        inputConfig: {...connector.inputConfig!, fileExists: false} as ConnectorDTO['inputConfig'],
      });
      expect(fixture.nativeElement.querySelector('app-edit-mapper')).not.toBeNull();

      await new Promise(resolve => setTimeout(resolve));
      await fixture.whenStable();

      expect(contentStep()).toBe(ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG);
    });

    it('opens the mapper when the user skips the transform step', async () => {
      await render(ConnectorManagementMode.EDIT, {...fileConnector(), id: 3});
      component.onCardClick(component.configCards()[2]);
      await fixture.whenStable();
      expect(contentStep()).toBe(ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
      (component as any)._configComponent = {onContinueClick: () => true};

      component.onContinueClick();
      expect(dialogs.length).toBe(1);

      dialogs[0].next(false);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('app-edit-mapper')).not.toBeNull();
      expect(contentStep()).toBeUndefined();
    });

    // Clicking the backdrop or pressing Escape closes the dialog with no result.
    it('stays on the specify-header step when the skip-transform dialog is dismissed', async () => {
      await render(ConnectorManagementMode.EDIT, {...fileConnector(), id: 3});
      component.onCardClick(component.configCards()[2]);
      await fixture.whenStable();
      (component as any)._configComponent = {onContinueClick: () => true};

      component.onContinueClick();
      dialogs[0].next(undefined);
      await fixture.whenStable();

      expect(contentStep()).toBe(ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
      expect(fixture.nativeElement.querySelector('app-edit-mapper')).toBeNull();
      expect(component.transformCards().length).toBe(0);
    });
  });

  async function render(mode: ConnectorManagementMode, connector?: ConnectorDTO): Promise<void> {
    dialogs = [];
    fileDetailResponse = new Subject<ConnectorFilesDetailDTO>();
    preview = jasmine.createSpy('preview').and.returnValue(of({rows: new Map(), stages: new Map()}));
    snackBarOpen = jasmine.createSpy('open');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: () => {
              const closed = new Subject<unknown>();
              dialogs.push(closed);
              return {afterClosed: () => closed.asObservable()};
            },
          },
        },
        {provide: FunctionService, useValue: {getAllFunctionsDetails: () => of([])}},
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {data: {}}, data: of({mode, connector}), fragment: of(null)},
        },
        {provide: ConnectorPreviewService, useValue: {preview}},
        {provide: ConnectorService, useValue: {}},
        {provide: Router, useValue: {navigate: () => Promise.resolve(true)}},
        {provide: TranslateService, useValue: {instant: (key: string) => key}},
        {
          provide: ConnectorUploadService,
          useValue: {
            getFirstCohortFileInfo: () => fileDetailResponse.asObservable(),
            getFileDetail: () => fileDetailResponse.asObservable(),
          },
        },
        {provide: Store, useValue: {selectSignal: () => signal([])}},
        {provide: MatSnackBar, useValue: {open: snackBarOpen}},
      ],
    });
    TestBed.overrideComponent(ManageConnectorComponent, {
      set: {imports: [TranslateStubPipe], schemas: [NO_ERRORS_SCHEMA]},
    });

    fixture = TestBed.createComponent(ManageConnectorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cohortId', cohortId);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  }

  /** The steps the drawer shows, read from the cards it rendered. */
  function drawerSteps(): (string | number)[] {
    const cards: NodeListOf<HTMLElement & { data?: ConnectorCard }> =
      fixture.nativeElement.querySelectorAll('mat-drawer app-connector-cards');
    return Array.from(cards).map(card => card.data!.step);
  }

  /** The step the content area shows, or undefined when it is not a config step. */
  function contentStep(): string | number | undefined {
    const stepConfig: (HTMLElement & { componentType?: string | number }) | null =
      fixture.nativeElement.querySelector('app-connector-step-config');
    return stepConfig?.componentType;
  }

  function fileConnector(): ConnectorDTO {
    return {
      cohortId,
      inputSource: {
        id: 'file_upload',
        icon: 'upload_file',
        title: 'File Import',
        description: '',
        configName: ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG,
      },
      inputConfig: {mode: 'FILE', fileType: 'CSV', fileId: 42, fileExists: true},
      fileInfo: {
        '0': {
          sheet: '0',
          columns: ['patient_id'],
          json: '[{"patient_id":"1"}]',
          fileExists: true,
        },
      },
    } as unknown as ConnectorDTO;
  }

  function fileDetail(): ConnectorFilesDetailDTO {
    return {
      id: 42,
      cohortId,
      fileName: 'patients.csv',
      uploadInfo: [{sheet: '0', columns: ['patient_id'], json: '[{"patient_id":"1"}]'}],
    } as unknown as ConnectorFilesDetailDTO;
  }
});

import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {ImportUploadSettings} from '../../dto/connector-import';
import {ImportActivity, ImportEventDTO, ImportProgressDTO} from '../../dto/import-progress';

/** What a view asks for when it starts an import. The id is chosen up front so it can be watched. */
export interface StartImportRequest {
  importId: string;
  cohortId: number;
  connectorId?: number;
  file: File;
  settings?: ImportUploadSettings;
  supportFile?: boolean;
}

export const ImportActions = createActionGroup({
  source: 'Connector Import',
  events: {
    /** Send the file. The upload's own response reports the whole import. */
    'Start Import': props<{request: StartImportRequest}>(),
    'Upload Progress': props<{importId: string; loaded: number; total: number; percent: number}>(),
    /** Something the server did: a phase, a table, or the end. */
    'Import Event': props<{event: ImportEventDTO}>(),
    /** The request itself came to nothing - the import never got an answer of its own. */
    'Import Stream Failed': props<{importId: string; message: string}>(),

    /** Stop an import and forget it. */
    'Cancel Import': props<{importId: string}>(),
    /** Let go of a finished import a view has acted on, so it is not shown again. */
    'Dismiss Import': props<{importId: string}>(),

    /** Watch an import this browser did not start, over the server-sent stream. */
    'Follow Import': props<{importId: string}>(),

    'Load Cohort Imports': props<{cohortId: number; connectorId?: number}>(),
    'Cohort Imports Loaded': props<{imports: ImportProgressDTO[]}>(),
    'Cohort Imports Load Failed': emptyProps(),

    /** An import reached its end, whichever end that was. For views that act on the result. */
    'Import Finished': props<{activity: ImportActivity}>(),
  },
});

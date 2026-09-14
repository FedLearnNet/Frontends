import {createReducer, on} from '@ngrx/store';
import {
  ImportActivity,
  ImportEventDTO,
  ImportProgressDTO,
  ImportTableDTO,
  isImportFinished,
} from '../../dto/import-progress';
import {ImportActions, StartImportRequest} from './import.actions';

export const importFeatureKey = 'connectorImports';

export interface ImportsState {
  activities: Record<string, ImportActivity>;
}

export const initialImportsState: ImportsState = {activities: {}};

export const importsReducer = createReducer(
  initialImportsState,

  on(ImportActions.startImport, (state, {request}): ImportsState => write(state, starting(request))),

  on(ImportActions.uploadProgress, (state, {importId, loaded, total, percent}): ImportsState =>
    patch(state, importId, activity => ({
      ...activity,
      transferred: loaded,
      transferPercent: percent,
      phase: activity.phase === 'TRANSFER' && total > 0 && loaded >= total ? 'PARSING' : activity.phase,
    }))),

  on(ImportActions.importEvent, (state, {event}): ImportsState =>
    patch(state, event.importId, activity => apply(activity, event))),

  on(ImportActions.importStreamFailed, (state, {importId, message}): ImportsState =>
    patch(state, importId, activity => activity.finishedAt
      // The import said how it ended before the connection carrying it did; that answer stands.
      ? activity
      : {...activity, phase: 'FAILED', error: message, finishedAt: Date.now()})),

  on(ImportActions.cancelImport, (state, {importId}): ImportsState => forget(state, importId)),

  on(ImportActions.dismissImport, (state, {importId}): ImportsState =>
    state.activities[importId]?.finishedAt === undefined ? state : forget(state, importId)),

  on(ImportActions.cohortImportsLoaded, (state, {imports}): ImportsState => {
    const unknown = imports.filter(report => !state.activities[report.importId]);
    return unknown.reduce((next, report) => write(next, adopted(report)), state);
  }),
);

function starting(request: StartImportRequest): ImportActivity {
  return {
    importId: request.importId,
    cohortId: request.cohortId,
    connectorId: request.connectorId,
    fileName: request.file.name,
    fileSize: request.file.size,
    phase: 'TRANSFER',
    transferred: 0,
    transferPercent: 0,
    tables: [],
    startedAt: Date.now(),
  };
}

function adopted(report: ImportProgressDTO): ImportActivity {
  const finished = isImportFinished(report.phase);
  return {
    importId: report.importId,
    cohortId: report.cohortId ?? 0,
    connectorId: report.connectorId,
    fileName: report.fileName ?? '',
    fileSize: report.fileSize ?? 0,
    phase: report.phase,
    transferred: report.fileSize ?? 0,
    transferPercent: 100,
    tables: report.tables ?? [],
    accepted: report.accepted,
    refusal: report.refusal,
    error: report.errorMessage,
    startedAt: Date.parse(report.startedAt ?? '') || Date.now(),
    finishedAt: finished ? Date.parse(report.finishedAt ?? '') || Date.now() : undefined,
  };
}

function apply(activity: ImportActivity, event: ImportEventDTO): ImportActivity {
  const next: ImportActivity = {
    ...activity,
    phase: event.phase ?? activity.phase,
    tables: event.tables ?? (event.table ? upsert(activity.tables, event.table) : activity.tables),
    error: event.errorMessage ?? activity.error,
  };
  if (!event.last) {
    return next;
  }
  return {
    ...next,
    result: event.result ?? next.result,
    accepted: event.result?.accepted ?? next.accepted,
    refusal: event.result?.error ?? next.refusal,
    finishedAt: Date.now(),
  };
}

function upsert(tables: ImportTableDTO[], table: ImportTableDTO): ImportTableDTO[] {
  const next = tables.some(existing => existing.name === table.name)
    ? tables.map(existing => existing.name === table.name ? table : existing)
    : [...tables, table];
  return [...next].sort((left, right) => left.position - right.position);
}

function write(state: ImportsState, activity: ImportActivity): ImportsState {
  return {...state, activities: {...state.activities, [activity.importId]: activity}};
}

function patch(
  state: ImportsState,
  importId: string,
  change: (activity: ImportActivity) => ImportActivity,
): ImportsState {
  const activity = state.activities[importId];
  return activity ? write(state, change(activity)) : state;
}

function forget(state: ImportsState, importId: string): ImportsState {
  const {[importId]: _removed, ...activities} = state.activities;
  return {...state, activities};
}

import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ImportActivity} from '../../dto/import-progress';
import {importFeatureKey, ImportsState} from './import.reducer';

const ADOPTABLE_AFTER_FINISH_MS = 2 * 60 * 1000;

export const selectImportsState = createFeatureSelector<ImportsState>(importFeatureKey);

export const selectAllImports = createSelector(
  selectImportsState,
  state => Object.values(state.activities).sort((left, right) => right.startedAt - left.startedAt),
);

export const selectImport = (importId: string | undefined) => createSelector(
  selectImportsState,
  state => importId ? state.activities[importId] : undefined,
);

export const selectCohortImports = (cohortId: number | undefined) => createSelector(
  selectAllImports,
  imports => imports.filter(activity => activity.cohortId === cohortId),
);


export function adoptableImport(
  imports: ImportActivity[],
  cohortId: number | undefined,
  connectorId: number | undefined,
): ImportActivity | undefined {
  return imports.find(activity =>
    activity.cohortId === cohortId
    && activity.connectorId === connectorId
    && (activity.finishedAt === undefined
      || Date.now() - activity.finishedAt < ADOPTABLE_AFTER_FINISH_MS));
}

export const selectAdoptableImport = (
  cohortId: number | undefined,
  connectorId: number | undefined,
) => createSelector(
  selectAllImports,
  imports => adoptableImport(imports, cohortId, connectorId),
);

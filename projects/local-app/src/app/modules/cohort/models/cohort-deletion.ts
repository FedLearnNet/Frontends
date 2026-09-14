import {CohortDetailDto} from '@local-app/cohort/models/cohort';

export type CohortDeletionPollEvent =
  | { type: 'in_progress'; cohort: CohortDetailDto }
  | { type: 'completed' };

export function isCohortDeleting(cohort: { deletionInProgress?: boolean } | null | undefined): boolean {
  return cohort?.deletionInProgress === true;
}

import { CohortPatient } from './cohort-patient';
import { CohortQueriability } from './cohort-queriability';
import { CohortListItem } from '@local-app/utils/models/cohort-list-item';

export interface Cohort extends CohortListItem {
    patients: CohortPatient[];
    queriability: CohortQueriability;
}

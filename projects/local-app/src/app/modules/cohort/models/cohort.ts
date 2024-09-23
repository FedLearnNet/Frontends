import { CohortPatient } from './cohort-patient';
import { CohortListItem } from '@local-app/utils/models/cohort-list-item';

export interface Cohort extends CohortListItem {
    patients: CohortPatient[];
}

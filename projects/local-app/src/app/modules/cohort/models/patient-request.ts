import { CohortPatient } from '@local-app/cohort/models/cohort-patient';

export interface PatientRequest {
    cohortId: number;
    externalPatientId: string;
    dataEntries: CohortPatient[];
    internalPatientId?: number;
}

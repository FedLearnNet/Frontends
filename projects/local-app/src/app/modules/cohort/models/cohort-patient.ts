import { PatientDataStatus } from '@local-app/cohort/enums';

export interface CohortPatient {
    id: number | null;
    age: number | null;
    files: File[] | null;
    dietaryScore: number | null;
    colorectalCancer: boolean | null;
    sex: string | null;
    recordStatus: PatientDataStatus | null;
    patientId: string | null;
}

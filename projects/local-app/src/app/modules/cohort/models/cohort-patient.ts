export interface CohortPatient {
    id: number | null;
    age: number | null;
    files: File[] | null;
    dietaryScore: number | null;
    colorectalCancer: boolean | null;
    sex: string | null;
    patientId: string | null;
}

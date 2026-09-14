export const EXTERNAL_PATIENT_ID_ANCHOR = 'external-patient-id';

export interface PatientValidationIssue {
  anchorId: number | typeof EXTERNAL_PATIENT_ID_ANCHOR;
}

export enum AuditFieldEnum {
  EXTERNAL_PATIENT_ID = 'EXTERNAL_PATIENT_ID',
  KEYCLOAK_ID = 'KEYCLOAK_ID',
  CONNECTOR_ID = 'CONNECTOR_ID',
  RUN_ID = 'RUN_ID',
  REVISION_TYPE = 'REVISION_TYPE',
  COHORT_ID = 'COHORT_ID',
  REVISION_NUMBER = 'REVISION_NUMBER',
  REVISION_TIMESTAMP = 'REVISION_TIMESTAMP',
}

export const DEFAULT_SEARCHABLE_FIELDS: AuditFieldEnum[] = [
  AuditFieldEnum.EXTERNAL_PATIENT_ID,
  AuditFieldEnum.KEYCLOAK_ID,
  AuditFieldEnum.CONNECTOR_ID,
  AuditFieldEnum.RUN_ID,
  AuditFieldEnum.REVISION_TYPE,
];

export type FilterKeys =
  | 'externalPatientId'
  | 'keycloakId'
  | 'connectorId'
  | 'runId'
  | 'revisionType';

export const FILTER_TO_FIELD: Record<FilterKeys, AuditFieldEnum> = {
  externalPatientId: AuditFieldEnum.EXTERNAL_PATIENT_ID,
  keycloakId: AuditFieldEnum.KEYCLOAK_ID,
  connectorId: AuditFieldEnum.CONNECTOR_ID,
  runId: AuditFieldEnum.RUN_ID,
  revisionType: AuditFieldEnum.REVISION_TYPE,
};

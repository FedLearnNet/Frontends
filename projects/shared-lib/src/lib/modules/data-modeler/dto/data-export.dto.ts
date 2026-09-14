export enum PatientDataPivotJoinField {
  PATIENT_ID = "PATIENT_ID",
  VISIT_ID = "VISIT_ID",
  VISIT_TIMESTAMP = "VISIT_TIMESTAMP",
  VISIT_TIMESTAMP_FORMAT = "VISIT_TIMESTAMP_FORMAT",
  IMPORT_SCHEMA_GROUP_ID = "IMPORT_SCHEMA_GROUP_ID",
}

export enum PatientDataPivotDuplicatePolicy {
  KEEP_FIRST = "KEEP_FIRST",
  KEEP_LAST = "KEEP_LAST",
  ERROR = "ERROR",
}

export class SelectedDataIdsDTO {
  globalOntologyId: string;
  globalDataTypeId: string;
}

export class PatientExportFeatureDTO {
  name: string;
  order: number;
  allowedDataIds: SelectedDataIdsDTO[];
  targetDatatypeId?: string;
}

export class PatientExportFilterDTO {
  externalPatientIds?: string[];
  limit?: number;
}

export class PatientDataExportConfigDTO {
  appBased: boolean;

  //for native export
  wideFormat?: boolean;
  joinFields?: PatientDataPivotJoinField[];
  duplicatePolicy?: PatientDataPivotDuplicatePolicy;

  //For app based export
  hyperParams?: { [key: string]: any };
  globalAppVersionId?: number;

  //For selection
  features?: PatientExportFeatureDTO[];

  //Narrows the exported patients; absent means every patient of the cohort
  patientFilter?: PatientExportFilterDTO;
}

import {BaseDto} from "@shared-lib/base/base-dto";


export interface MetaPatientDataEntryDTO extends BaseDto {
  schemaNodeId?: number;
  value?: any;
}

export interface PatientDataEntryDto extends BaseDto {
  schemaNodeId: number;
  value: any;
  visitId?: string;
  visitTimestamp?: string;
  visitTimestampFormat?: string;
  metaData?: MetaPatientDataEntryDTO[];
}

export interface PatientDataEntryCreateDto {
  schemaNodeId: number;
  value: any;
  visitId?: string;
  visitTimestamp?: string;
  visitTimestampFormat?: string;
}


export interface PatientDto extends BaseDto {
  cohortId: number;
  externalPatientId: string;

  dataEntries: PatientDataEntryDto[];
}



/** Identifies a patient without any of their data; used by the export patient filter. */
export interface PatientReferenceDto {
  id: number;
  externalPatientId: string;
}

import {BaseDto} from "@shared-lib/base/base-dto";
import {ProjectDetailDto} from "@global-app/project/dto/project";

export enum FederatedLearningRequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  'REJECTED' = 'REJECTED',
  'APPROVED' = 'APPROVED',
  'RUNNING' = 'RUNNING',
}

export interface PatientLearningDto extends BaseDto {

  projectName: string;
  cohortName: string;

  externalPatientId: string;

  internalPatientId: number;
  internalCohortId: number;

  patientId: number;
  requestId: number;
}

export interface FederatedLearningRequestDto extends BaseDto {
  status: FederatedLearningRequestStatus;
  requestPatients?: PatientLearningDto[];
  patientCountByCohort?: Record<number, number>;
  project: ProjectDetailDto;
  modelNeedToBePublic?: boolean;
  modelCanBePublic?: boolean;
}

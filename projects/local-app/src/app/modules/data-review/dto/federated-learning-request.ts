import {BaseDto} from "@shared-lib/base/base-dto";
import {TrainingStatus} from "@local-app/data-review/models";
import {ProjectDetailDto} from "@global-app/project/dto/project";

export interface FederatedLearningRequestPatientsDto {
  patientIds: string[];
  cohortId: string;
}
export interface FederatedLearningRequestDto extends BaseDto {
  platformUserId: string;
  description: string;
  name: string;
  status: TrainingStatus;
  requestPatients: FederatedLearningRequestPatientsDto[];
  project: ProjectDetailDto;
}

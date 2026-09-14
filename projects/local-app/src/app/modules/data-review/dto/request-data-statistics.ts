import {BaseDto} from "@shared-lib/base/base-dto";
import {FederatedLearningRequestStatus} from "@local-app/data-review/dto/federated-learning-request";

export interface RequestDataStatisticsDto extends BaseDto {
  requestKeycloakId: string;
  verifiedOn?: Date;
  verifiedByKeycloakId?: string;
  status: FederatedLearningRequestStatus;
  queryId: number;
  cohortIds: number[];
  patientIds: number[];
}

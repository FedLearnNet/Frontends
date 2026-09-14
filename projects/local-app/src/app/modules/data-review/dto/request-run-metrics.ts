import {BaseDto} from '@shared-lib/base/base-dto';
import {FederatedLearningRequestStatus} from '@local-app/data-review/dto/federated-learning-request';

export interface RequestRunMetricsDto extends BaseDto {
  requestKeycloakId: string;
  verifiedOn?: Date;
  verifiedByKeycloakId?: string;
  status: FederatedLearningRequestStatus;
  experimentId: number;
  globalRequestId: string;
  projectName?: string;
  metricNames?: string[];
}

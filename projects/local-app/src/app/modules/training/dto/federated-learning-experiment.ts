import {BaseWorkflowExperimentDTO} from "@shared-lib/modules/experiments/dto/experiments";

export interface FederatedLearningExperimentDto extends BaseWorkflowExperimentDTO {
  uniqueRandomClinicId: string;
  projectId: number;
}

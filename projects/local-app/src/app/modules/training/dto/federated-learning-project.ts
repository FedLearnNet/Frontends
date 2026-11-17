import {ProjectDetailDto} from "@global-app/project/dto/project";
import {ExecutionRunDetailDTO} from "@shared-lib/modules/app-execution/dto/execution-run";

export interface FederatedLearningProjectDto {
  project: ProjectDetailDto;
  // This clinic's run of the training, a step per node of the project's workflow; set up once it was approved.
  run?: ExecutionRunDetailDTO | null;
  workflowId?: number | null;
}

// A training run waiting for a free slot of this client.
export interface QueuedRunDto {
  runId: number;
  name?: string;
  mode?: 'SINGLE' | 'TRE' | 'FEDERATED';
  // 1 starts next
  position: number;
  queuedAt?: string;
}

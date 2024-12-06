import {BaseDto} from "@shared-lib/base/base-dto";
import {WorkflowElementDto} from "./workflow";

export enum ProjectStatus {
  INIT = "Init",
  READY = "Ready",  // People can join
  PREPARE = "Prepare",  // Create input volumes and prepare everything for run. No one can join anymore
  RUNNING = "Running",  // Workflow is running
  SHUTDOWN = "Shutdown",  // Workflow is stopping
  STOPPED = "Stopped",  // Workflow has been stopped, containers are shut down
  ERROR = "Error",  // Workflow has been stopped, containers are shut down
  FINISHED = "Finished"  // Workflow has been completed
}

export interface ProjectCreateDto {
  name: string;
  description: string;
  queryId?: number;
}

export interface ProjectDto extends BaseDto {
  name: string;
  description: string;
  queryId?: number;
  dataTypeIds: string[];
  status: ProjectStatus;
  role?: 'coordinator' | 'participant';
}

export interface ProjectDetailDto extends ProjectDto {

  workflow?: WorkflowElementDto[];
  isAudited?: boolean;
}

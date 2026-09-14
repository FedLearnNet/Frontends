import {BaseDto} from "@shared-lib/base/base-dto";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {PatientDataExportConfigDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";

export enum ProjectStatus {
  INIT = "INIT",
  READY = "READY",  // People can join
  PREPARE = "PREPARE",  // Create input volumes and prepare everything for run. No one can join anymore
  RUNNING = "RUNNING",  // Workflow is running
  SHUTDOWN = "SHUTDOWN",  // Workflow is stopping
  STOPPED = "STOPPED",  // Workflow has been stopped, containers are shut down
  ERROR = "ERROR",  // Workflow has been stopped, containers are shut down
  FINISHED = "FINISHED"  // Workflow has been completed
}

export interface ProjectCreateDto {
  name: string;
  description: string;
  queryId?: number;
}

export enum ProjectRole {
  COORDINATOR = "COORDINATOR",
  PARTICIPANT = "PARTICIPANT",
}

export interface ProjectDto extends BaseDto {
  name: string;
  description: string;
  globalUniqueQueryId?: string;
  queryId?: number;
  workflowId?: number | undefined;
  exportConfig?: PatientDataExportConfigDTO;
  status: ProjectStatus;
  coordinatorHasData?: boolean;
  platformIsCoordinator?: boolean;
  role?: ProjectRole;
  file?: FileDTO;
}

export interface ProjectDetailDto extends ProjectDto {
  isAudited?: boolean;
  verifiedOn?: Date;
  certificationLevel?: number;
  isCoordinator?: boolean;
}

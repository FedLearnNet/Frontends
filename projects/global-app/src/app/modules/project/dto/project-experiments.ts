import {BaseDto} from "@shared-lib/base/base-dto";
import {ProjectDetailDto, ProjectStatus} from "@global-app/project/dto/project";
import {ExperimentDiagramConfigDTO} from "../../test-app/dto/config";


export interface ProjectFederatedCreateExperimentDTO{
  name: string;
  description: string;
}
export interface ProjectFederatedExperimentDTO extends BaseDto {
  name: string;
  description: string;
  acceptanceCount: number;
  status: ProjectStatus;
  projectVersion: ProjectDetailDto;
  diagramConfigs: ExperimentDiagramConfigDTO[];
  relayServerAddress: string;
  finishedAt: Date;
  startedAt: Date;
  projectId: number;
}



export interface ProjectLocalCreateExperimentDTO{
  name: string;
  description: string;
}
export interface ProjectLocalExperimentDTO extends BaseDto {
  name: string;
  description: string;
  status: ProjectStatus;
  projectVersion: ProjectDetailDto;
  diagramConfigs: ExperimentDiagramConfigDTO[];
  finishedAt: Date;
  startedAt: Date;
  projectId: number;
}

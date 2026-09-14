import {BaseDto} from "@shared-lib/base/base-dto";
import {ModelPublishStatus, ModelSubStatus} from "@global-app/model-store/dto/model-status";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ModelAccessDto} from "@global-app/model-store/dto/model-access";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {PipelineStatus} from "../../../../../../global-app/src/app/modules/pipeline/dto/pipeline";
import {ProjectDto} from "@global-app/project/dto/project";
import {QueryDTO} from "@global-app/find-data/dto/query";


export interface ModelDto extends BaseDto {

  name: string;
  uniqueModelId: string;
  shortDescription: string;
  longDescription: string;

  publishStatus: ModelPublishStatus;

  lastVersion?: ModelVersionDto;

  federatedAppId: number;
  federatedApp: AppDetailDto;
}

export interface ModelDetailDto extends ModelDto {
  modelVersions?: ModelVersionDto[];

  createdByUser: boolean;

  creator: ModelAccessDto;

  //Only if user is owner
  accesses: ModelAccessDto[];

}

export interface ModelVersionDto extends BaseDto {

  modelVersion: string;
  changelog: string;
  modelId: number;

  publishStatus: ModelPublishStatus;

  selectedSubModel?: ModelSubDto;
  subModels?: ModelSubDto[];

  experimentRunId?: number;
  federatedExperimentId?: number;
}


export interface ModelSubDto extends BaseDto {

  imageName?: string;

  status: ModelSubStatus;
  pipelineStatus?: PipelineStatus;
  pipelineId?: number;

  files: ModelSubFileDTO[];

  modelVersionId: number;
  modelId: number;

  experimentRunId?: number;
  federatedExperimentId?: number;

  federatedData?: FederatedModelSubDetailDataDto;

}

export interface FederatedModelSubDetailDataDto {
  project: ProjectDto;
  query?: QueryDTO;
}

export interface ModelSubFileDTO extends BaseDto {
  modelSubId: number;
  file: FileDTO
}

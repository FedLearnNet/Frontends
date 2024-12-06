import {BaseDto} from "@shared-lib/base/base-dto";
import {ModelPublishStatus, ModelSubStatus} from "@global-app/model-store/dto/model-status";
import {AppDto} from "@global-app/app-store/dto/app";
import {ModelAccessDto} from "@global-app/model-store/dto/model-access";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";


export interface ModelDto extends BaseDto {

  name: string;
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
}


export interface ModelSubDto extends BaseDto {

  modelParams: string;
  imageName: string;

  status: ModelSubStatus;

  modelVersionId: number;
  experimentRunId?: number;


}

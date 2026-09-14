import {BaseDto} from "@shared-lib/base/base-dto";
import {FederatedAppType, PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {AppPublishInfoDTO} from "@shared-lib/modules/store/dto/publish-info";
import {ToolAuditDTO} from "../../../../../../global-app/src/app/modules/audit/dto/audit";

export interface UrlDTO {
  url: string;
}

export interface AppCreateDTO {
  name: string;
  slug: string;
  shortDescription: string;
  type: FederatedAppType;
  supportsFederatedLearning?: boolean;
}

export interface AppDto extends BaseDto {
  name: string;
  uniqueAppId: string;
  slug: string | null;

  type: FederatedAppType;
  supportsFederatedLearning?: boolean;
  publishStatus: PublishStatus;
  sourceUrl: string;

  tags?: AppTagDto[];
  icon?: string;
  isUpdateAvailable?: boolean;

  //based on latestVersion:
  publishInfo?: AppPublishInfoDTO;
  audits?: ToolAuditDTO[];
  imageName?: string;
  shortDescription: string;
  longDescription: string;
  certificationLevel: number;
  hasImage?: boolean;
  needsInternetAccess: boolean;
  needsHostAccess: boolean;
  //version
  latestVersionId: number;
  latestVersion: string;

  //rating
  average?: number;
  count?: number;
}


export interface AppTagDto extends BaseDto {
  name: string;
  privacy: boolean;
}

export interface AppPublishDTO {
  version: string;
  changelog?: string;
  createModel: boolean;
  needsInternetAccess: boolean;
  needsHostAccess: boolean;
}

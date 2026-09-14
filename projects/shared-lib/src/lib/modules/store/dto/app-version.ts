import {BaseDto} from "@shared-lib/base/base-dto";
import {PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {ToolConfigsDTO} from "@shared-lib/modules/app-execution/dto/config";
import {AppPublishInfoDTO} from "@shared-lib/modules/store/dto/publish-info";
import {ToolAuditDTO} from "../../../../../../global-app/src/app/modules/audit/dto/audit";

export interface AppVersionDto extends BaseDto {

  federatedAppId: number;

  appVersion: string;
  certificationLevel: number;

  changelog: string;

  audits?: ToolAuditDTO[];
  versionPublishStatus: PublishStatus;
  needsInternetAccess: boolean;
  needsHostAccess: boolean;
  publishInfo?: AppPublishInfoDTO;

  imageName: string;
  shortDescription: string;
  longDescription: string;

  appConfig: ToolConfigsDTO;

}

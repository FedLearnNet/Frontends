import {BaseDto} from "@shared-lib/base/base-dto";
import {PublishStatus} from "@global-app/app-store/dto/enum";
import {ConfigDTO} from "../../test-app/dto/config";

export interface AppVersionDto extends BaseDto {

  federatedAppId: number;

  appVersion: string;
  certificationLevel: number;

  changelog: string;

  versionPublishStatus:  PublishStatus;
  imageName: string;
  shortDescription: string;
  longDescription: string;

  appConfig: ConfigDTO;

}

import {BaseDto} from "@shared-lib/base/base-dto";
import {FederatedAppType, PublishStatus} from "@global-app/app-store/dto/enum";


export interface AppDto extends BaseDto {
  name: string;
  slug: string | null;

  //TODO  remove
  hasFrontend: boolean;
  stopAppManually: boolean;

  type: FederatedAppType;
  publishStatus: PublishStatus;
  sourceUrl: string;

  tags?: AppTagDto[];
  icon?: string;
  isUpdateAvailable?: boolean;

  //based on latestVersion:
  imageName: string;
  shortDescription: string;
  longDescription: string;
  certificationLevel: number;
  hasImage?: boolean;

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

export interface AppRatingDto extends BaseDto {
  keycloakId: string;
  federatedAppId: number;
  rating: number;
  reviewText: string;
}

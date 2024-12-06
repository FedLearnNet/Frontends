import {AppDto, AppRatingDto} from "@global-app/app-store/dto/app";
import {ConfigDTO} from "../../test-app/dto/config";
import {AuthorDto} from "@global-app/app-store/dto/app-author";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";

export interface AppDetailDto extends AppDto{

  addedToWorkflowCount?: number;
  lastAddedToWorkflow?: string;

  versions: AppVersionDto[];
  authors: AuthorDto[];
  reviews: AppRatingDto[];

  //based on latestVersion:
  appConfig: ConfigDTO;
}


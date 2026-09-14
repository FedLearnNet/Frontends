import {AppDto} from "@shared-lib/modules/store/dto/app";
import {AuthorDto} from "@shared-lib/modules/store/dto/app-author";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {ToolConfigsDTO} from "@shared-lib/modules/app-execution/dto/config";

export interface AppDetailDto extends AppDto {

  addedToWorkflowCount?: number;
  lastAddedToWorkflow?: string;

  versions: AppVersionDto[];
  authors: AuthorDto[];

  //based on latestVersion:
  appConfig: ToolConfigsDTO;
}


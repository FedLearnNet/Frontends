import {ModelDto} from "@shared-lib/modules/app-execution/dto/model";
import {AppDto} from "@shared-lib/modules/store/dto/app";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";


export interface StoreDTO {
  model?: ModelDto;
  app?: AppDto;
  workflow?: WorkflowDTO
}

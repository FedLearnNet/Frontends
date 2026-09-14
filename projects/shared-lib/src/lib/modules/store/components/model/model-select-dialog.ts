import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";

export interface StoreSelectDialogResult {
  model?: ModelDetailDto;
  app?: AppDetailDto;
  workflow?: WorkflowDTO;
}

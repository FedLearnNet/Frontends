import {BaseAuthDto, BaseDto} from "@shared-lib/base/base-dto";
import {IPoint} from "@foblex/2d";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {ToolInputConfigDTO} from "@shared-lib/modules/app-execution/dto/config";

export interface WorkflowConnectionDTO extends BaseDto {
  inputId: string
  outputId: string;

  inputConnection: boolean;

  inputNodeId: string
  outputNodeId: string;

  inputConfigName: string;
  outputConfigName: string;

  workflowId?: string;
}


export interface WorkflowNodeDTO extends BaseDto {
  nodeId: string;
  workflowId?: number;
  federatedAppId?: number;
  federatedAppVersionId?: number;
  modelSubId?: number;
  appVersion?: string;
  imageName?: string;
  position: IPoint;
  hyperParams?: { [key: string]: any };
  oldFCVersion?: boolean;
  supportsFederatedLearning?: boolean;
  hasChildren?: boolean;
  hasParent?: boolean;
  executionOrder?: number;
}


export interface WorkflowNodeDetailDTO extends WorkflowNodeDTO {
  appDetail?: AppDetailDto;
  modelDetail?: ModelDetailDto;

  //only internal
  extended: boolean;
}


export interface WorkflowCreateDTO {
  projectId?: number;
}


export interface WorkflowInputDTO extends ToolInputConfigDTO {
  position: IPoint;
  nodeId: string;
}


export interface WorkflowDTO extends BaseAuthDto {
  nodes: WorkflowNodeDetailDTO[];
  connections: WorkflowConnectionDTO[];
  inputs: WorkflowInputDTO[];

  name?: string;
  description?: string;
  publishStatus: PublishStatus;
}

import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";

export interface ToolGraphDTO {
  nodes: ToolGraphNodeDTO[];
  edges: ToolGraphEdgeDTO[];
}

export interface ToolGraphNodeDTO {
  app: AppDetailDto;
}

export interface ToolGraphEdgeDTO {
  fromAppId: number;
  toAppId: number;
  score?: number;
  matches?: ToolPortMatchDTO[];
}

export interface ToolPortMatchDTO {
  outputVariable: string;
  inputVariable: string;
  outputType?: string;
  inputType?: string;
  reason?: string;
}

export interface ToolGraphPathDTO{
  fromAppId: number;
  toAppId: number;
  edges: ToolGraphEdgeDTO[];
  hops: number;
}

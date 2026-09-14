import {ToolGraphPathDTO} from "@shared-lib/modules/store/dto/tool-graph";

export interface ShortestPath{
  path: ToolGraphPathDTO;
  hideOtherEdges: boolean;
  name: string;
}

export interface ShortestPathDialog{
  fromAppId: number;
  toAppId: number;
  howMany: number;
}

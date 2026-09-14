import {SchemaNodeDetailDTO, SchemaNodeDTO} from "@global-app/schema/dto/schema";

export interface SchemaDetailDialog {
  root: SchemaNodeDTO;
  parent?: SchemaNodeDTO;
  current?: SchemaNodeDetailDTO;
}

import {SchemaDTO} from "@global-app/schema/dto/schema";

export interface SchemaDetailDialog {
  root: SchemaDTO;
  parent?: SchemaDTO;
  current?: SchemaDTO;
}

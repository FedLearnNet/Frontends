import {BaseNodeDTO} from "@global-app/schema/dto/base";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {DataTypeNodeDTO} from "@global-app/schema/dto/datatype";

export enum SchemaNodeType {
  ROOT = "ROOT",
  GROUP = "GROUP",
  LIST_ATTRIBUTE = "LIST_ATTRIBUTE",
  ATOMIC_ATTRIBUTE = "ATOMIC_ATTRIBUTE"
}


export interface SchemaNodeDTO extends BaseNodeDTO {
  isRoot?: boolean;

  name: string;
  description: string;
  type: SchemaNodeType;

  parentId?: string;
  childrenIds?: string[];

  dataTypeId?: string;
  ontologyId?: string;

  // Only for root nodes
  subscriptions?: string[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number;
}

export interface SchemaNodeDetailDTO extends SchemaNodeDTO {
  ontology: OntologyNodeDTO;
  dataType: DataTypeNodeDTO;

}

export interface SchemaStructureDTO extends SchemaNodeDetailDTO {
  children?: SchemaStructureDTO[];
}

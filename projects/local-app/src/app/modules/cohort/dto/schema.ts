import {BaseDto} from "@shared-lib/base/base-dto";
import {DataTypeDto} from "@local-app/cohort/dto/data-type";
import {OntologyDto} from "@local-app/cohort/dto/ontology";


export enum SchemaNodeTypeEnum {
  ROOT = "ROOT",
  GROUP = "GROUP",
  ATTRIBUTE = "ATTRIBUTE",
  ATOMIC_ATTRIBUTE = "ATOMIC_ATTRIBUTE",
  LIST_ATTRIBUTE = "LIST_ATTRIBUTE",
}

export function isSchemaDataColumnNode(node: SchemaNodeNestedDto): boolean {
  if (node.nodeType === SchemaNodeTypeEnum.GROUP
    || node.nodeType === SchemaNodeTypeEnum.ROOT
  ) {
    return false;
  }

  return !!(node.ontology && node.dataType);
}

export interface SchemaNodeDto extends BaseDto {
  nodeType: SchemaNodeTypeEnum;
  name: string;
  description?: string;
  parentId?: number;

  globalId: string;
  childrenIds?: string[];

  //TODO THERE ARE NOT ALWAYS HERE SO TURN INTO?
  ontology: OntologyDto;
  dataType: DataTypeDto;
}

export interface SchemaNodeNestedDto extends SchemaNodeDto {
  childNodes: SchemaNodeNestedDto[];
}

export interface SchemaRootNodeDto extends BaseDto {
  name: string;
  description?: string;

  globalId: string;
  globalVersion: number;

  nodeType: SchemaNodeTypeEnum; //will be always SchemaNodeTypeEnum.ROOT
  childNodes: SchemaNodeNestedDto[];
}

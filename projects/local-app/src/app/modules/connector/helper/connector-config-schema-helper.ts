import {ConnectorDTO} from "../dto/connector";
import {CohortDetailDto} from "@local-app/cohort/models";
import {SchemaNodeNestedDto, SchemaNodeTypeEnum, SchemaRootNodeDto} from "@local-app/cohort/dto/schema";
import {ConnectorMappingConfig} from "../models/connector-model";


export function rematchMappingSchemaId(config: ConnectorDTO, cohort: CohortDetailDto): ConnectorDTO {
  const schemaMappings: ConnectorMappingConfig[] | undefined = config.schemaMapping;
  if (!schemaMappings || schemaMappings.length === 0) {
    return config;
  }
  const root: SchemaRootNodeDto = cohort.schemaRoot;
  const nodes: SchemaNodeNestedDto[] = root.childNodes;
  for(const schemaMapping of schemaMappings) {
    if(schemaMapping.mapping !== undefined) {
      schemaMapping.schemaId = findSchemaId(schemaMapping.mapping, nodes)
    }
  }
  return {
    ...config,
    schemaMapping: schemaMappings
  }
}

export function findSchemaId(mapping: string, nodes: SchemaNodeNestedDto[]): number | undefined {
  if (mapping.includes(".")) {
    const left = mapping.split(".")[0];
    const others = mapping.replace(left + ".", "")
    for (const node of nodes) {
      if (node.name === left &&
        node.nodeType === SchemaNodeTypeEnum.GROUP &&
        node.childNodes !== undefined &&
        node.childNodes.length > 0) {
        return findSchemaId(others, node.childNodes)
      }
    }
  }
  for (const node of nodes) {
    if (node.name === mapping && node.nodeType === SchemaNodeTypeEnum.ATTRIBUTE) {
      return node.id;
    }
  }
  return undefined;
}

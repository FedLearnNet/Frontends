export interface SchemaDTO {
  uniqueId?: string;
  name: string;
  desc: string;
  type: string;

  parentId?: string;
  dataTypeId?: string;
  ontologyId?: string;

  children?: SchemaDTO[];
}

import {BaseDto} from "@shared-lib/base/base-dto";

export interface BaseSchemaDto extends BaseDto {
  name?: string;
  desc?: string;
  is_required?: boolean;
  type?: string;
  parent_id?: string;
  data_type_id?: string;
  ontology_id?: string;
}

export interface SchemaDto extends BaseSchemaDto {
  children?: string[];
}

export interface SchemaStructureDto extends BaseSchemaDto {
  children: SchemaStructureDto[];
}

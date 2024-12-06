import {BaseDto} from "@shared-lib/base/base-dto";

export interface SchemaDynamicFieldValidationDto {
  name: string;
  validator: string;
  message: string;
}

export interface DataTypeDto extends BaseDto {
  desc?: string;
  allowed_values?: string[];
  allowed_values_extendible?: boolean;
  validations?: SchemaDynamicFieldValidationDto[];
  mapping?: any;
  name?: string;
  type?: string;
  ontology_id?: string;
}

export interface DataTypeUsagesDTO {
  usage?: number;
  data_type?: DataTypeDto;
}

import {BaseDto} from "@shared-lib/base/base-dto";


export interface DataTypeDto extends BaseDto {

  description: string;
  name: string;
  type: DataTypeTypeEnum;
  formType: DatatypeFormTypeEnum;


  ontologyIds?: string[];
  globalId?: string;
  schemaIds?: string[];

  validations?: DataTypeValidationDto[];
  options?: DataTypeOptionsDto[];
  value?: string;

  allowedValues?: string[];
  allowedValuesExtendible?: boolean;
  mapping?: Record<string, string>;

  isReadonly?: boolean;
  allowNullValues?: boolean;
  isRequired?: boolean;
}


export interface DataTypeValidationDto {
  name: DataTypeValidationNameEnum;
  validator?: string;
  message?: string;
}

export interface DataTypeOptionsDto {
  value: string | boolean | number;
  label: string;
}


export enum DataTypeValidationNameEnum {
  MINLENGTH = 'MINLENGTH',
  MAXLENGTH = 'MAXLENGTH',
  PATTERN = 'PATTERN',
  MIN = 'MIN',
  MAX = 'MAX'
}


export enum DataTypeTypeEnum {
  INT = "INT",
  FLOAT = "FLOAT",
  BOOLEAN = "BOOLEAN",
  STRING = "STRING",
  FILE = "FILE",
  DATE = "DATE",
  DATE_TIME = "DATE_TIME",
  CATEGORICAL = "CATEGORICAL"
}

export enum DatatypeFormTypeEnum {
  NUMBER = "NUMBER",
  RADIO = "RADIO",
  SELECT = "SELECT",
  FILE = "FILE",
  DATE = "DATE",
  DATE_TIME = "DATE_TIME",
  TEXT = "TEXT"
}

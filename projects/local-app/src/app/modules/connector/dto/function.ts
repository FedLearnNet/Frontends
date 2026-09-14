export interface AppTransformerMappings {
  column?: string | null;
  hyperparams?: Record<string, any> | null;
  inputMapping?: Record<string, any> | null;
  returnMapping?: Record<string, any> | null;
}

export enum FunctionExecutionParameterType {
  STRING = 'STRING',
  OBJECT = 'OBJECT',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  DOUBLE = 'DOUBLE',
  MAP = 'MAP'
}

export enum FunctionParameterUsage {
  INPUT = 'INPUT',
  HYPERPARAMETER = 'HYPERPARAMETER'
}

export interface FunctionParameterDTO {
  name: string;
  type?: FunctionExecutionParameterType | null;
  required?: boolean;
  defaultValue?: string | null;
  description?: string | null;
  choices?: string[];
  usage?: FunctionParameterUsage;
}

export enum FunctionExecutionMode {
  ROW = 'ROW',
  CELL = 'CELL',
  PATIENT = 'PATIENT'
}

export interface FunctionsDetailDTO extends AppTransformerMappings {
  moduleName: string;
  methodName: string;
  description?: string | null;
  mode: FunctionExecutionMode;
  parameters: FunctionParameterDTO[];
  returnKeys: string[];
  appVersionId?: number | null;
  appImage?: string | null;
}

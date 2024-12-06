export enum FederatedAppConfigHyperParamDataType {
  CATEGORICAL = 'CATEGORICAL',
  BOOLEAN = 'BOOLEAN',
  FLOAT = 'FLOAT',
  INTEGER = 'INTEGER',
  STRING = 'STRING',
}

export enum FederatedAppConfigInputDataType {
  CSV = 'CSV',
  JSON = 'JSON',
  MIXED = 'MIXED',
  FLOAT = 'FLOAT',
  INTEGER = 'INTEGER',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  CATEGORICAL = 'CATEGORICAL',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  TIME_SERIES = 'TIME_SERIES',
  SPARSE = 'SPARSE',
  TENSOR = 'TENSOR',
}

export enum FederatedAppConfigOutputDataType {
  HTML = 'HTML',
  CSV = 'CSV',
  JSON = 'JSON',
  MIXED = 'MIXED',
  FLOAT = 'FLOAT',
  INTEGER = 'INTEGER',
  STRING = 'STRING',
}

export enum FederatedAppConfigModeType {
  TRAINING = 'TRAINING',
  PREDICTION = 'PREDICTION',
  BOTH = 'BOTH'
}

export interface ConfigHyperparamDTO {
  name: string;
  variableName?: string;
  mode: FederatedAppConfigModeType;
  type: FederatedAppConfigHyperParamDataType;
  description: string;
  default: string;

  options?: string[];
  minValue?: number;
  maxValue?: number;
  pattern?: string;
}

export interface ConfigInputDTO {
  name: string;
  variableName?: string;
  mode: FederatedAppConfigModeType;
  type: FederatedAppConfigInputDataType;
  description: string;
  required: boolean;

  minValue?: number;
  maxValue?: number;
  shape?: string;
}

export interface ConfigOutputDTO {
  name: string;
  variableName?: string;
  mode: FederatedAppConfigModeType;
  type: FederatedAppConfigOutputDataType;
  description: string;

  minValue?: number;
  maxValue?: number;
  shape?: string;
}

export interface ConfigDTO {
  hyperparams: ConfigHyperparamDTO[];
  input: ConfigInputDTO[];
  output: ConfigOutputDTO[];
}

export interface ConfigPydanticDTO {
  hyperparam: string;
  input: string;
  output: string;
}

export interface ClientConfigDTO {
  APP_KEY: string;

  ENABLE_CONFIG_SYNC: string;
  TRACE_PERFORMANCE: string;
}


export interface ExperimentDiagramConfigDTO {
  name: string;
  dataAggregatorType?: 'max' | 'min' | 'avg' | 'all';
  xAxisHeader: string;
  yAxisHeader: string;
  seriesType: 'bar' | 'line' | 'scatter';
}



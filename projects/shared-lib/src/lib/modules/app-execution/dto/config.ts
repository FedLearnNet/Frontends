export enum ToolConfigDataType {
  HTML = 'HTML',
  CSV = 'CSV',
  TSV = 'TSV',
  JSON = 'JSON',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  UNKNOWN = 'UNKNOWN',
  STRING = 'STRING',
  PATH = 'PATH',
  MIXED = 'MIXED',
}

export enum ToolConfigHyperParamDataType {
  CATEGORICAL = 'CATEGORICAL',
  BOOLEAN = 'BOOLEAN',
  FLOAT = 'FLOAT',
  INTEGER = 'INTEGER',
  STRING = 'STRING',
}

export enum ToolConfigModeType {
  TRAINING = 'TRAINING',
  PREDICTION = 'PREDICTION',
  BOTH = 'BOTH'
}

export interface ToolHyperParamConfigDTO {
  name: string;
  variableName?: string;
  mode: ToolConfigModeType;
  type: ToolConfigHyperParamDataType;
  description: string;
  default: any;

  options?: string[];
  minValue?: number;
  maxValue?: number;
  pattern?: string;
}

export interface ToolConfigDTO {
  name: string;
  variableName?: string;
  mode: ToolConfigModeType;
  type: ToolConfigDataType;
  description: string;

  //CSV
  hasHeader?: boolean;
  delimiter?: string;
  indexCol?:number;

  minValue?: number;
  maxValue?: number;
  shape?: string;

  tabularSchema?: TabularSchemaDTO | null;
}

export interface ToolInputConfigDTO extends ToolConfigDTO {
  required: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToolOutputConfigDTO extends ToolConfigDTO {
  // Additional properties specific to input configurations can be added here
  // none for now
}

export interface ToolConfigsDTO {
  hyperparams: ToolHyperParamConfigDTO[];
  input: ToolInputConfigDTO[];
  output: ToolOutputConfigDTO[];
}


export interface NullValuePolicyDTO {
  // truly missing CSV fields (empty between delimiters), e.g. `a,,c`
  prohibitedEmptyCell?: boolean;

  //prohibited empty string values after parsing, e.g. "" (quoted empty)
  prohibitedEmptyString?: boolean;

  // prohibited whitespace-only strings like "   " (before/after trimming — define in backend
  prohibitedWhitespaceString?: boolean;

  // prohibited string tokens that represent null (case-insensitive), e.g. "null", "none", "na"
  prohibitedNullLiterals?: boolean;

  // prohibited numeric NaN (actual NaN after parsing numeric columns)
  prohibitedNaN?: boolean;

  // prohibited 0 / 0.0 as a “null sentinel” (domain-specific)
  prohibitedZeroAsNull?: boolean;

  // Explicit list of null tokens
  // Used if prohibitedNullLiterals === true
  nullLiterals?: string[];
}

export interface ColumnRuleDTO {
  type?: ToolConfigHyperParamDataType;
  nullable?: boolean;
  regex?: string | null;
  enumValues?: string[] | null;
  min?: number | null;
  max?: number | null;
  description?: string | null;
}

export interface TabularSchemaDTO {
  minRows?: number | null;
  maxRows?: number | null;
  minColumns?: number | null;
  maxColumns?: number | null;

  allowOnlyNumbers?: boolean;
  prohibitedNulls?: boolean;
  nullPolicy?: NullValuePolicyDTO;

  requiredColumns?: string[];

  columns?: Record<string, ColumnRuleDTO>;
}


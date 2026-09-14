import {
  ToolConfigHyperParamDataType,
  ToolHyperParamConfigDTO,
  ToolInputConfigDTO,
  ToolOutputConfigDTO
} from "@shared-lib/modules/app-execution/dto/config";

export const VISUALISATIONS_KEY = 'visualisations';

export interface AppOutputVisualisations {
  visualisation?: any;
  name?: string;
  description?: string;
}

export interface ConfigOutputEditModel {
  editMode?: boolean;
}


export interface ConfigHyperparamEditModel extends ToolHyperParamConfigDTO {
  editMode?: boolean;
  showValidate?: boolean;
  edited?: boolean;
}


export interface ConfigInputEditModel extends ToolInputConfigDTO {
  editMode?: boolean;
}

export interface ConfigOutputEditModel extends ToolOutputConfigDTO {
  editMode?: boolean;
}


export interface ConfigDataTypeOption {
  key: ToolConfigHyperParamDataType;
  value: string;
}
export const ConfigDataTypeSelectionArray: ConfigDataTypeOption[] = [
  {key: ToolConfigHyperParamDataType.FLOAT, value: 'float'},
  {key: ToolConfigHyperParamDataType.CATEGORICAL, value: 'categorical'},
  {key: ToolConfigHyperParamDataType.INTEGER, value: 'int'},
  {key: ToolConfigHyperParamDataType.BOOLEAN, value: 'bool'},
  {key: ToolConfigHyperParamDataType.STRING, value: 'string'},
];
export const ConfigDataTypeSelectionOnlyNumberArray: ConfigDataTypeOption[] = [
  {key: ToolConfigHyperParamDataType.FLOAT, value: 'float'},
  {key: ToolConfigHyperParamDataType.INTEGER, value: 'int'},
];


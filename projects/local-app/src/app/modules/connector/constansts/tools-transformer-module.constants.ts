import {FunctionExecutionMode, FunctionsDetailDTO} from '../dto/function';

export const TOOLS_TRANSFORMER_MODULE: FunctionsDetailDTO = {
  moduleName: 'tools',
  methodName: 'tools_transformer',
  parameters: [],
  returnKeys: [],
  inputMapping: {},
  returnMapping: {},
  mode: FunctionExecutionMode.CELL,
};

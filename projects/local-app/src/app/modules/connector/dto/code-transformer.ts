import {BaseDto} from '@shared-lib/base/base-dto';
import {StatusBadeType} from '@shared-lib/components/status-badge/status-badge.component';
import {BasePipelineDTO} from '@shared-lib/modules/pipeline/dto/pipeline';
import {FunctionExecutionMode, FunctionParameterUsage, FunctionsDetailDTO} from './function';
import {DataTypeTypeEnum, DataTypeValidationDto} from '../../cohort/dto/data-type';

export interface CodeTransformerGoalDTO {
  type: DataTypeTypeEnum;
  validations?: DataTypeValidationDto[];
  options?: string[];
  isRequired?: boolean;
  allowNullValues?: boolean;
}

export interface CodeTransformerCheckDTO {
  body: string;
  mode: FunctionExecutionMode;
  goal: CodeTransformerGoalDTO;
  sourceGoals?: Record<string, CodeTransformerGoalDTO> | null;
  data?: Record<string, unknown[]> | null;
}

export interface CodeTransformerCheckResultDTO {
  isSuccess: boolean;
  message: string;
  inputKeys: string[];
  returnKeys: string[];
  samples?: CodeTransformerSampleDTO[];
}

export interface CodeTransformerSampleDTO {
  input: unknown;
  output: unknown;
  error?: string | null;
}

export enum CodeTransformerRunnerStatus {
  STOPPED = 'STOPPED',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
}

export interface CodeTransformerRunnerDTO {
  status: CodeTransformerRunnerStatus;
  image?: string;
  error?: string | null;
}

export interface CodeTransformerLogDTO {
  time: string;
  message: string;
}

export enum CodeTransformerStatus {
  BUILDING = 'BUILDING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface CodeTransformerSaveDTO extends CodeTransformerCheckDTO {
  id?: number | null;
  name: string;
  description?: string;
}

export interface CodeTransformerUsageDTO {
  connectorId: number;
  connectorName: string;
  cohortId: number;
}

export interface CodeTransformerPipelineDTO extends BasePipelineDTO {
  codeTransformerId: number;
}

export interface CodeTransformerDTO extends BaseDto, CodeTransformerSaveDTO {
  id: number;
  inputKeys: string[];
  returnKeys: string[];
  files: Record<string, string>;
  codeHash: string;
  imageName?: string | null;
  status: CodeTransformerStatus;
  pipeline?: CodeTransformerPipelineDTO | null;
  usages: CodeTransformerUsageDTO[];
}

export const CODE_TRANSFORMER_MODULE = 'Custom code';

export function codeTransformerFunction(transformer: CodeTransformerDTO): FunctionsDetailDTO {
  const cell = transformer.mode === FunctionExecutionMode.CELL;
  return {
    moduleName: CODE_TRANSFORMER_MODULE,
    methodName: transformer.name,
    description: transformer.description,
    mode: transformer.mode,
    parameters: cell ? [] : transformer.inputKeys.map(name => ({name, usage: FunctionParameterUsage.INPUT})),
    returnKeys: cell ? [] : transformer.returnKeys,
    appImage: transformer.imageName,
  };
}

const CODE_TRANSFORMER_BADGE: Record<CodeTransformerStatus, StatusBadeType> = {
  [CodeTransformerStatus.BUILDING]: 'RUNNING',
  [CodeTransformerStatus.READY]: 'SUCCESS',
  [CodeTransformerStatus.FAILED]: 'FAILED',
};

export function codeTransformerBadge(status: CodeTransformerStatus): StatusBadeType {
  return CODE_TRANSFORMER_BADGE[status];
}

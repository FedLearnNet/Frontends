import {FunctionExecutionMode} from './function';
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

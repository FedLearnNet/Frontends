import {UploadInfoDTO} from "./upload-info";
import {
  AppBasedUploadSettings,
  FileUploadSettings,
  FTPUploadSettings,
  FunctionUploadSettings
} from "../models/input-config";
import {ConnectorSourceCard} from "../models/connector-card";
import {ConnectorMappingConfig} from "../models/connector-model";
import {FunctionExecutionMode, FunctionsDetailDTO} from "./function";
import {BaseDto} from "@shared-lib/base/base-dto";
import {ConnectorRunDTO} from "./run";
import {ConnectorValueMappingConfig} from '../models/connector-value-mapping';

export type ConnectorInputConfigDTO =
  | FileUploadSettings
  | AppBasedUploadSettings
  | FTPUploadSettings
  | FunctionUploadSettings;

export enum ConnectorTriggerTypeEnum {
  ON_CONNECTOR_SUCCESS = "ON_CONNECTOR_SUCCESS"
}

export interface ScheduleSettingsDTO {
  enabled?: boolean;
  cronExpression?: string;
}

export interface TriggerSettingsDTO {
  type?: ConnectorTriggerTypeEnum;
  sourceConnectorId?: number;
}

export interface SheetMergeResultDTO {
  uidColumn: string;
  sheetUidMapping: Record<string, string>;
  commonUidColumnName: string;
}

export interface PivotConfigDTO {
  valueColumnIndex: Record<string, number>;
  mode?: Record<string, PivotMode>;
  prefix?: Record<string, string>;
  valueFormat?: Record<string, PivotValueFormat>;
}

export enum PivotMode {
  TRANSPOSE = 'TRANSPOSE',
  ONE_HOT = 'ONE_HOT'
}

export enum PivotValueFormat {
  TRUE_FALSE = 'TRUE_FALSE',
  YES_NO = 'YES_NO',
  ONE_ZERO = 'ONE_ZERO'
}

export interface ConnectorDTO extends BaseDto {
  name?: string;
  description?: string;

  inputSource?: ConnectorSourceCard;
  inputConfig?: ConnectorInputConfigDTO;
  uploadInfo?: Record<string, UploadInfoDTO>;
  fileInfo?: Record<string, UploadInfoDTO>;
  cohortId?: number;
  schemaMapping?: ConnectorMappingConfig[];
  transformer?: Array<ConnectorTransformerDTO | FunctionsDetailDTO>;
  mergeConfig?: SheetMergeResultDTO;
  pivotConfig?: PivotConfigDTO;

  triggerSettings?: TriggerSettingsDTO;
  scheduleSettings?: ScheduleSettingsDTO;

  linkedFileId?: number | null;

  // currently based on query
  dry?: boolean;

  lastRun?: ConnectorRunDTO;
}

export interface ConnectorTransformerDTO extends BaseDto {
  moduleName?: string;
  methodName?: string;
  mode?: FunctionExecutionMode;
  inputMapping?: Record<string, any>;
  returnMapping?: Record<string, any>;
  column?: string;
  position?: number;

  // For remote app execution
  appVersionId?: string | number | null;
  appImage?: string | null;
  hyperparams?: Record<string, any>;

  connectorId?: number;
}

export interface ConnectorMappingDTO {
  column: string;
  mapping?: string;
  schemaId?: number;
  visitTimestampMapping?: string;
  visitIdMapping?: string;
  timestampFormat?: string;
  valueMappingConfig?: ConnectorValueMappingConfig;
}

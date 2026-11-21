import {ExecutionRunDetailDTO} from "@shared-lib/modules/app-execution/dto/execution-run";
import {ConnectorFileUploadInfoDTO} from "./upload-info";

export interface AppBasedExtractorRequestDTO {
  cohortId: number;

  appImage: string;
  appVersionId: number;

  hyperParams?: Record<string, any>;
  inputData?: Record<string, any>;
}

export interface ConnectorExtractorStreamDTO extends ExecutionRunDetailDTO {
  uploadInfo: ConnectorFileUploadInfoDTO[];
  outputParams?: Record<string, number | string>;
  cached?: boolean;
  hash?: string;
}

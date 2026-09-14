import {ConnectorRunStepDTO} from "./log";
import {ConnectorFileUploadInfoDTO} from "./upload-info";

export interface AppBasedExtractorRequestDTO {
  cohortId: number;

  appImage: string;
  appVersionId: number;

  hyperParams?: Record<string, any>;
  inputData?: Record<string, any>;
}

export interface ConnectorExtractorStreamDTO extends ConnectorRunStepDTO {
  uploadInfo: ConnectorFileUploadInfoDTO[];
  cached?: boolean;
  hash?: string;
}

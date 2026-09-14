import {BaseAuthDto} from "@shared-lib/base/base-dto";
import {ConnectorRunStep, ImportStatusEnum} from "./connector.enum";

export interface ConnectorRunDTO extends Partial<BaseAuthDto> {
  status?: ImportStatusEnum;
  currentStep?: ConnectorRunStep;
  dryRun?: boolean;
  expectedElements?: number; //total number of patients

  progressExtracting?: number;
  currentTransformingStep?: number;
  currentElementNr?: number;
  currentRowNr?: number;
  progress?: number;

  newEntities?: number;
  updatedEntities?: number;
  deletedEntities?: number;
  failedEntities?: number;
  unchangedEntities?: number;
  receivedEntities?: number;
  processedEntities?: number;
  newDataEntries?: number;
  failedDataEntries?: number;

  errorMessage?: string;

  cohortId?: number;
  connectorId?: number;
}

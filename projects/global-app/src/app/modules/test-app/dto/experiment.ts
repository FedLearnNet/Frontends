import {BaseDto} from "@shared-lib/base/base-dto";
import {RunStatusTypes} from "./test-run";
import {RunMessageMetricDTO} from "./log";
import {ExperimentDiagramConfigDTO} from "./config";


export interface ExperimentDTO extends BaseDto {

  status: RunStatusTypes;

  name: string;
  description: string;
  inputData?: string;
  inputFilePaths?: { [key: string]: string };

  federatedAppId: number;
  federatedAppVersionId: number;
  federatedAppVersionName: string;
}

export interface ExperimentRunDTO extends BaseDto {

  status: RunStatusTypes;
  error: string;
  name: string;
  color: string;
  hyperParams: { [key: string]: string };
  outputData: { [key: string]: string };
  metrics: RunMessageMetricDTO[];
  experimentId: number;
}


export interface ExperimentDetailDTO extends ExperimentDTO {

  runs: ExperimentRunDTO[]
  diagramConfigs: ExperimentDiagramConfigDTO[];
}


export interface CreateExperimentDetailDTO {
  name: string;
  description: string;
  inputFilePaths?: { [key: string]: string[] };

  federatedAppVersionId: number;
  hyperParams: { [key: string]: string[] };
}


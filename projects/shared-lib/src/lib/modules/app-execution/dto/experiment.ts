import {BaseDto} from "@shared-lib/base/base-dto";
import {ExperimentDiagramConfigDTO} from "../../../../../../global-app/src/app/modules/tool-development/dto/config";
import {RunMessageMetricDTO} from "../../experiments/dto/log";
import {RunStatusTypes} from "../../../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {RunMeta} from "./run-meta";


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

  // Run metadata (timings today). meta.timings.RUNTIME always present when measured; OVERHEAD_*
  // only when the backend flag posymed.runtime.overhead.enabled is true.
  meta?: RunMeta | null;
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


import {BaseDto} from "@shared-lib/base/base-dto";
import {RunMeta} from "@shared-lib/modules/app-execution/dto/run-meta";


export enum RunStatusTypes {
  PENDING = "PENDING",
  INITIALIZED = "INITIALIZED",
  STARTED = "STARTED",
  RUNNING = "RUNNING",
  STOPPED = "STOPPED",
  FINISHED = "FINISHED",
  ERROR = "ERROR"
}


export interface TestRunDTO extends BaseDto {

  status: RunStatusTypes;
  error: string;
  hyperParams: { [key: string]: string };
  inputData: { [key: string]: string };
  outputData: { [key: string]: string };

  // Run metadata (timings today). meta.timings.RUNTIME is always present when measured; the
  // OVERHEAD_* entries only when the backend flag posymed.runtime.overhead.enabled is true.
  meta?: RunMeta | null;

  federatedAppId: number;
  federatedAppVersionId: number;
  federatedAppVersionName: string;
}


export interface TestRunCreateDTO {
  federatedAppVersionId: number;
  hyperParams: { [key: string]: string };
  inputFilePaths?: { [key: string]: string };
  projectId?: number;
}

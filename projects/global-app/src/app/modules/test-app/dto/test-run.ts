import {BaseDto} from "@shared-lib/base/base-dto";


export enum RunStatusTypes {
  PENDING = "pending",
  INITIALIZED = "initialized",
  STARTED = "started",
  RUNNING = "running",
  FINISHED = "finished",
  ERROR = "error"
}


export interface TestRunDTO extends BaseDto {

  status: RunStatusTypes;
  error: string;
  hyperParams: { [key: string]: string };
  inputData: { [key: string]: string };
  outputData: { [key: string]: string };

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

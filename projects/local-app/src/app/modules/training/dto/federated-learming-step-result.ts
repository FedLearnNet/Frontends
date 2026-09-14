import {BaseDto} from "@shared-lib/base/base-dto";
import {FileDTO} from "@shared-lib/modules/files/dto/file";


export interface FederatedLearningExperimentStepResultDTO extends BaseDto{

  result?: string;
  name?: string;
  stepId: number;
  file?: FileDTO
}

import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {BaseDto} from "@shared-lib/base/base-dto";

export interface DataAnalysisFileDTO extends BaseDto {
  dataAnalysisId: number;
  file: FileDTO;

  // Optional association to a prediction
  outputName?: string;
  inputName?: string;
  predictionId?: number;
}

import {BaseDto} from "@shared-lib/base/base-dto";
import {RunStatusTypes} from "../../test-app/dto/test-run";


export interface PredictionCreateDto extends BaseDto {
  input: string;
  modelSubId: number;
}

export interface PredictionDto extends PredictionCreateDto {

  status: RunStatusTypes;
  result: string;
  error: string;

  modelName: string;
  modelId: number;
}

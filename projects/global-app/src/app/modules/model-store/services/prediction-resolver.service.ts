import {ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {PredictionService} from "@global-app/model-store/services/prediction.service";
import {DataAnalysisPredictionDTO} from "@shared-lib/modules/app-execution/dto/prediction";


export const predictionsResolver: ResolveFn<DataAnalysisPredictionDTO[]> = () => {
  return inject(PredictionService).getPredictions();
}


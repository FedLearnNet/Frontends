import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {PredictionService} from "@global-app/model-store/services/prediction.service";
import {PredictionDto} from "@global-app/model-store/dto/prediction";


export const predictionsResolver: ResolveFn<PredictionDto[]> = () => {
  return inject(PredictionService).getPredictions();
}

export const predictionModelResolver: ResolveFn<PredictionDto[]> = (route: ActivatedRouteSnapshot) => {
  return inject(PredictionService).getPredictionsForModel(Number(route.paramMap.get('model-id')));
}

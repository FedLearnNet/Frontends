import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Model, Prediction } from '../models';
import { ModelService } from './model.service';

export const modelListResolver: ResolveFn<Model[]> = () => {
    return inject(ModelService).getModels();
}

export const predictionListResolver: ResolveFn<Prediction[]> = () => {
    return inject(ModelService).getPredictions();
}

export const modelResolver: ResolveFn<Model> = (route: ActivatedRouteSnapshot) => {
    return inject(ModelService).getModel(Number(route.paramMap.get('model-id')));
}

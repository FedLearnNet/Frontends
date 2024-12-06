import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {ModelDetailDto, ModelDto} from "@global-app/model-store/dto/model";
import {ModelService} from "@global-app/model-store/services/model.service";
import {catchError, of} from "rxjs";


export const modelsResolver: ResolveFn<ModelDto[]> = () => {
  return inject(ModelService).getModels().pipe(
    catchError(() => of([]))
  );
}


export const myModelResolver: ResolveFn<ModelDto[]> = () => {
  return inject(ModelService).getMyModels().pipe(
    catchError(() => of([]))
  );
}

export const modelResolver: ResolveFn<ModelDetailDto> = (route: ActivatedRouteSnapshot) => {
  return inject(ModelService).getModel(Number(route.paramMap.get('model-id')));
}

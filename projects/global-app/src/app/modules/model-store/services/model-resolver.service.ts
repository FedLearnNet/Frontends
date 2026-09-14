import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {ModelService} from "@global-app/model-store/services/model.service";


export const modelResolver: ResolveFn<ModelDetailDto> = (route: ActivatedRouteSnapshot) => {
  return inject(ModelService).getModel(Number(route.paramMap.get('model-id')));
}

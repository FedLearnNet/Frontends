import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {loadModelDetail, loadModels, loadMyModels} from "@shared-lib/modules/app-execution/store/model/model.actions";

export const modelsResolver: ResolveFn<void> = () => {
  inject(Store).dispatch(loadModels());
}


export const myModelResolver: ResolveFn<void> = () => {
  inject(Store).dispatch(loadMyModels({}));
}

export const modelResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const modelId = route.paramMap.get('model-id');
  if (!modelId) {
    return false;
  }
  store.dispatch(loadModelDetail({id: +modelId}));
  return true;
}

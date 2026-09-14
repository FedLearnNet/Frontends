import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";


export const modelStoreResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const modelId = route.paramMap.get('model-id');
  if (!modelId) {
    return false;
  }
  store.dispatch(StoreActions.loadModel({id: +modelId}));
  return true;
}

export const appStoreResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const idOrSlug = route.paramMap.get('app-id');
  if (!idOrSlug) {
    return false;
  }
  store.dispatch(StoreActions.loadApp({idOrSlug: idOrSlug}));
  return true;
}

export const appStoreGraphResolver: ResolveFn<boolean> = (_route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  store.dispatch(StoreActions.loadGraph({}));
  return true;
}

import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {loadFile, loadFiles} from "@shared-lib/modules/files/store/file.actions";


export const filesStoreResolver: ResolveFn<void> = () => {
  inject(Store).dispatch(loadFiles());
}

export const fileStoreResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const idOrSlug = route.paramMap.get('file-id');
  if (!idOrSlug) {
    return false;
  }
  store.dispatch(loadFile({id: +idOrSlug}));
  return true;
}


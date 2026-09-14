import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {AuditActions} from "./audit.actions";

export const toolPendingAuditResolver: ResolveFn<boolean> = (_route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  store.dispatch(AuditActions.loadPending());
  return true;
}

export const toolAuditResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const appVersionIdString = route.paramMap.get('version-id');
  if (!appVersionIdString) {
    return false;
  }
  const appVersionId = Number(appVersionIdString);
  store.dispatch(AuditActions.loadByVersion({appVersionId}));
  return true;
}


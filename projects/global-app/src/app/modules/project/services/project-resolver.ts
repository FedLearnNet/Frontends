import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {ProjectActions} from "@global-app/project/store/project.actions";

export const projectResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  inject(Store).dispatch(ProjectActions.load({id: +route.paramMap.get('projectId')!}));
}

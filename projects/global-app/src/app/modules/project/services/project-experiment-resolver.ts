import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {ProjectRunsActions} from "@global-app/project/store/project-runs.actions";
import {ProjectRunKind} from "@global-app/project/dto/project-experiments";

// Follows the training the route names; the route data says where it runs.
export const projectRunResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  const projectId = +route.paramMap.get('projectId')!;
  const runId = +route.paramMap.get('experiment-id')!;
  const kind = route.data['kind'] as ProjectRunKind;
  inject(Store).dispatch(ProjectRunsActions.follow({projectId, kind, runId}));
}

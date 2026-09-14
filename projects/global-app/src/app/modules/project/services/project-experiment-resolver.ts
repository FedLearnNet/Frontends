import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {ProjectLocalExperimentsActions} from "@global-app/project/store/project-local-experiments.actions";
import {ProjectFederatedExperimentsActions} from "@global-app/project/store/project-federated-experiments.actions";

export const projectLocalExperimentResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  const projectId = +route.paramMap.get('projectId')!;
  const id = +route.paramMap.get('experiment-id')!;
  inject(Store).dispatch(ProjectLocalExperimentsActions.loadExperiment({projectId, id}));
}

export const projectFedExperimentResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  const projectId = +route.paramMap.get('projectId')!;
  const id = +route.paramMap.get('experiment-id')!;
  inject(Store).dispatch(ProjectFederatedExperimentsActions.loadExperiment({projectId, id}));
}


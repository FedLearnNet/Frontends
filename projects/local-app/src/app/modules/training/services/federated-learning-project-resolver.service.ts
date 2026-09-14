import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {FederatedLearningProjectService} from '../services/federated-learning-project.service';
import {PaginatedResponse} from "@shared-lib/models";
import {FederatedLearningProjectDto} from "../dto/federated-learning-project";
import {Store} from "@ngrx/store";
import {FederatedLearningProjectActions} from "../store/federated-learning-project.actions";

export const startedFederatedLearningProjectsResolver: ResolveFn<PaginatedResponse<FederatedLearningProjectDto>> = () => {
  return inject(FederatedLearningProjectService).getAllStartedFederatedLearningProjects();
}

export const federatedLearningProjectDetailResolver: ResolveFn<void> = (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('fl-request-id');
  const parsedId = +id!
  inject(Store).dispatch(FederatedLearningProjectActions.loadDetail({id: parsedId}));
}

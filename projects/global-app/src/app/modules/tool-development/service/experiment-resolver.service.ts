import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {ExperimentService} from "./experiment-run.service";
import {ExperimentDetailDTO} from "@shared-lib/modules/app-execution/dto/experiment";


export const experimentResolver: ResolveFn<ExperimentDetailDTO> = (route: ActivatedRouteSnapshot) => {
  return inject(ExperimentService).getExperiment(route.paramMap.get('app-id'), route.paramMap.get('experimentId'));
}

export const runIdResolver: ResolveFn<number> = (route: ActivatedRouteSnapshot) => {
  return route.paramMap.get('runId') ? +route.paramMap.get('runId')! : -1;
}


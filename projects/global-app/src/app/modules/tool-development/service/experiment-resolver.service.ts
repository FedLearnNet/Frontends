import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {inject} from '@angular/core';
import {ExperimentService} from "./experiment-run.service";
import {TestRunDTO} from "../dto/test-run";


export const experimentResolver: ResolveFn<TestRunDTO> = (route: ActivatedRouteSnapshot) => {
  return inject(ExperimentService).getExperiment(route.paramMap.get('app-id'), route.paramMap.get('experimentId'));
}

export const runIdResolver: ResolveFn<number> = (route: ActivatedRouteSnapshot) => {
  return route.paramMap.get('runId') ? +route.paramMap.get('runId')! : -1;
}


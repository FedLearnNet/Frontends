import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import {AppService} from "@global-app/app-store/service/app.service";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ExperimentDetailDTO} from "../dto/experiment";
import {ExperimentService} from "./experiment-run.service";


export const experimentResolver: ResolveFn<ExperimentDetailDTO> = (route: ActivatedRouteSnapshot) => {
    return inject(ExperimentService).getExperiment(route.paramMap.get('app-id'), route.paramMap.get('experimentId'));
}

export const runIdResolver: ResolveFn<number> = (route: ActivatedRouteSnapshot) => {
  return route.paramMap.get('runId') ? +route.paramMap.get('runId')! : -1;
}


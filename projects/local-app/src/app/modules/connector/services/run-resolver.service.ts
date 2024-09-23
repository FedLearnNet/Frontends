import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {ConnectorRunService} from "./run.service";
import {RunDTO} from "../dto/run";


export const runResolver: ResolveFn<RunDTO | null> = (route: ActivatedRouteSnapshot) => {
  return inject(ConnectorRunService).get(route.paramMap.get('run-id'));
}



import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, ResolveFn} from '@angular/router';
import {ConnectorRunService} from "./run.service";
import {ConnectorRunDTO} from "../dto/run";
import {LogService} from '../../logs/services/log-service';
import {toNumber} from 'lodash';
import {RunStatisticsDto} from '../../logs/dto/logs';
import {catchError, of} from 'rxjs';


export const runResolver: ResolveFn<ConnectorRunDTO | null> = (route: ActivatedRouteSnapshot) => {
  return inject(ConnectorRunService).get(route.paramMap.get('run-id'));
}

export const runStatisticsResolver: ResolveFn<RunStatisticsDto> = (route: ActivatedRouteSnapshot) => {
  return inject(LogService).getRunStatistics(toNumber(route.paramMap.get('run-id'))).pipe(
    catchError(() => {
      return of({} as RunStatisticsDto);
    })
  );
}

import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import {AppService} from "./app.service";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";

export const myAppResolver: ResolveFn<AppDetailDto> = (route: ActivatedRouteSnapshot) => {
  return inject(AppService).getMyApp(route.paramMap.get('app-id'));
}


export const appsResolver: ResolveFn<AppDetailDto[]> = () => {
  return inject(AppService).getMyApps();
}

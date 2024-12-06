import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import {AppService} from "@global-app/app-store/service/app.service";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";


export const appResolver: ResolveFn<AppDetailDto> = (route: ActivatedRouteSnapshot) => {
    return inject(AppService).getApp(route.paramMap.get('app-id'));
}
export const myAppResolver: ResolveFn<AppDetailDto> = (route: ActivatedRouteSnapshot) => {
  return inject(AppService).getMyApp(route.paramMap.get('app-id'));
}


export const appsResolver: ResolveFn<AppDetailDto[]> = () => {
  return inject(AppService).getMyApps();
}

import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, EMPTY, map, Observable} from "rxjs";
import {environment} from "@global-app/env/environment";
import {AppCreateDTO, AppDto, AppPublishDTO, UrlDTO} from "@shared-lib/modules/store/dto/app";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ConfigPydanticDTO} from "../dto/config";
import {TranslateService} from '@ngx-translate/core';
import {ToolStartupGeneratorCreateDTO} from "../dto/startup";
import {ToolConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'apps'

  public getApps(): Observable<AppDto[]> {
    return this.apiService.get<AppDto[]>(this.getBaseUrl())
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.APPS').toLowerCase()})))
      );
  }

  public getMyApps(): Observable<AppDetailDto[]> {
    return this.apiService.get<AppDetailDto[]>(this.getBaseUrl() + "/my")
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.APPS').toLowerCase()})))
      );
  }

  public getApp(idOrSlug: number | string | null): Observable<AppDetailDto> {
    if (!idOrSlug) {
      return EMPTY;
    }
    return this.apiService.get<AppDetailDto>(this.getBaseUrl() + "/" + idOrSlug)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.APP').toLowerCase()})))
      );
  }

  public getPredefinedConfig(): Observable<ToolConfigDTO[]> {
    return this.apiService.get<ToolConfigDTO[]>(this.getBaseUrl() + "/predefined/config")
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.PREDEFINED_CONFIG').toLowerCase()})))
      );
  }

  public generateStartupZip(id: number, data: ToolStartupGeneratorCreateDTO): Observable<HTMLAnchorElement> {
    if (!id) {
      return EMPTY;
    }
    return this.apiService.downloadPost(this.getBaseUrl() + "/tool-startup-generator/" + id, undefined, undefined, data).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_GENERATE', {name: this.translate.instant('GRID.DUMMY_DATA').toLowerCase()})))
    );
  }

  public getMyApp(id: number | string | null): Observable<AppDetailDto> {
    if (!id) {
      return EMPTY;
    }
    return this.apiService.get<AppDetailDto>(this.getBaseUrl() + "/my/" + id)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.APP').toLowerCase()})))
      );
  }

  public publishApp(appId: number, dto: AppPublishDTO): Observable<AppDetailDto> {
    return this.apiService.post<AppDetailDto>(this.getBaseUrl() + "/" + appId + "/publish", dto)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_PUBLISH', {name: this.translate.instant('GRID.APP').toLowerCase()})))
      );
  }

  public exportAppAsJson(appId: number): Observable<string> {
    return this.apiService.post<UrlDTO>(this.getBaseUrl() + "/" + appId + "/export", {})
      .pipe(
        map(url => url.url),
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_EXPORT', {name: this.translate.instant('GRID.APP').toLowerCase()})))
      );
  }

  public replaceBuildInfoInJson(appId: number): Observable<string> {
    return this.apiService.post<UrlDTO>(this.getBaseUrl() + "/" + appId + "/export/build-info", {}).pipe(map(url => url.url));
  }

  public createApp(app: AppCreateDTO): Observable<AppDetailDto> {
    return this.apiService.post<AppDetailDto>(this.getBaseUrl(), app,)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.APP').toLowerCase()})))
      );
  }

  public getAppPydantic(id?: number, versionId?: number): Observable<ConfigPydanticDTO> {
    if (!id || !versionId) {
      return EMPTY;
    }
    return this.apiService.get<ConfigPydanticDTO>(this.getBaseUrl() + "/" + id + "/pydantic/" + versionId)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.PYDANTIC').toLowerCase()})))
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

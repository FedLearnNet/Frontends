import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {catchError} from 'rxjs/operators';
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {StoreFilterParams} from "@shared-lib/modules/store/dto/store.filter";
import {PaginatedResponse} from "@shared-lib/models";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {ToolGraphDTO, ToolGraphPathDTO} from "@shared-lib/modules/store/dto/tool-graph";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";

@Injectable({providedIn: 'root'})
export class StoreService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;

  private readonly path = 'store';

  private baseUrl(): string {
    if (this.localApiURL) {
      return `${this.localApiURL}/${this.path}`;
    }
    return `${this.globalApiURL}/${this.path}`;
  }


  list(params?: StoreFilterParams): Observable<PaginatedResponse<StoreDTO>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => {
              httpParams = httpParams.append(key, v);
            });
          } else {
            httpParams = httpParams.set(key, value as string | number | boolean);
          }
        }
      });
    }

    return this.http.get<PaginatedResponse<StoreDTO>>(this.baseUrl(), {params: httpParams}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.STORE_ITEMS').toLowerCase()})
      ))
    );
  }

  graph(params?: StoreFilterParams): Observable<ToolGraphDTO> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => {
              httpParams = httpParams.append(key, v);
            });
          } else {
            httpParams = httpParams.set(key, value as string | number | boolean);
          }
        }
      });
    }

    return this.http.get<ToolGraphDTO>(this.baseUrl() + "/graph", {params: httpParams}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.STORE_ITEMS').toLowerCase()})
      ))
    );
  }

  graphShortsPath(from: number, to: number, many: number, params?: StoreFilterParams): Observable<ToolGraphPathDTO[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => {
              httpParams = httpParams.append(key, v);
            });
          } else {
            httpParams = httpParams.set(key, value as string | number | boolean);
          }
        }
      });
    }

    return this.http.get<ToolGraphPathDTO[]>(this.baseUrl() + `/graph/from/${from}/to/${to}/many/${many}`, {params: httpParams}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.STORE_ITEMS').toLowerCase()})
      ))
    );
  }

  getModel(id: number): Observable<ModelDetailDto> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.http.get<ModelDetailDto>(`${this.baseUrl()}/model/${id}`, {headers}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.MODEL').toLowerCase()})
      ))
    );
  }

  getWorkflow(id: number): Observable<WorkflowDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.http.get<WorkflowDTO>(`${this.baseUrl()}/workflow/${id}`, {headers}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.WORKFLOW').toLowerCase()})
      ))
    );
  }

  getApp(idOrSlug: string | number): Observable<AppDetailDto> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.http.get<AppDetailDto>(`${this.baseUrl()}/app/${idOrSlug}`, {headers}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.APP').toLowerCase()})
      ))
    );
  }

  getApps(ids: Array<string | number>): Observable<AppDetailDto[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }

    const params = new HttpParams({
      fromObject: {
        ids: ids.map(id => String(id))
      }
    });

    return this.http
      .get<AppDetailDto[]>(`${this.baseUrl()}/apps`, {params})
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.APP').toLowerCase()})
        ))
      );
  }

  getAppVersion(versionId: number): Observable<AppDetailDto> {
    return this.http.get<AppDetailDto>(`${this.baseUrl()}/app/version/${versionId}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.APP').toLowerCase()})
      ))
    );
  }

  getAppVersions(versionIds: number[]): Observable<AppDetailDto[]> {
    const params = new HttpParams({fromObject: {ids: versionIds.map(String)}});

    return this.http.get<AppDetailDto[]>(`${this.baseUrl()}/app/versions`, {params}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.APP').toLowerCase()})
      ))
    );
  }
}

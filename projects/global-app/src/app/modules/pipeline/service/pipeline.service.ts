import {inject, Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '@global-app/env/environment';
import {catchError, map, takeWhile} from 'rxjs/operators';
import {PipelineCreateDTO, PipelineDTO} from "../dto/pipeline";
import {SseClient} from "ngx-sse-client";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({providedIn: 'root'})
export class PipelineService {
  private readonly sseClient: SseClient = inject(SseClient);
  private readonly api: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'pipeline';

  private baseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  create(request: PipelineCreateDTO): Observable<PipelineDTO> {
    return this.api.post<PipelineDTO>(this.baseUrl(), request).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('LABEL.PIPELINE').toLowerCase()})))
    );
  }

  list(params?: { appVersionId?: number; appId?: number; modelSubId?: number }): Observable<PipelineDTO[]> {
    let httpParams = new HttpParams();
    if (params?.appVersionId != null) httpParams = httpParams.set('appVersionId', params.appVersionId);
    if (params?.modelSubId != null) httpParams = httpParams.set('modelSubId', params.modelSubId);
    if (params?.appId != null) httpParams = httpParams.set('appId', params.appId);

    return this.api.get<PipelineDTO[]>(this.baseUrl(), httpParams).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.PIPELINE').toLowerCase()})))
    );
  }

  get(id: number): Observable<PipelineDTO> {
    return this.api.get<PipelineDTO>(`${this.baseUrl()}/${id}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.PIPELINE').toLowerCase()})))
    );
  }

  stop(id: number): Observable<PipelineDTO> {
    return this.api.put<PipelineDTO>(`${this.baseUrl()}/${id}/stop`, {}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.PIPELINE').toLowerCase()})))
    );
  }

  stream(id: number): Observable<PipelineDTO> {
    const url = `${this.baseUrl()}/${id}/stream`;

    return this.sseClient.stream(
      url,
      {keepAlive: false, responseType: 'event'}
    ).pipe(
      map((event: Event) => {
        if ((event as any).type === 'error') {
          const errorEvent = event as ErrorEvent;
          console.error(errorEvent.error, errorEvent.message);
          throw new Error('SSE connection error');
        }
        const messageEvent = event as MessageEvent;
        return JSON.parse(messageEvent.data) as PipelineDTO;
      }),
      takeWhile((dto: PipelineDTO) => (dto as any).status !== 'FINISHED'),
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.PIPELINE').toLowerCase()})))
    );
  }
}

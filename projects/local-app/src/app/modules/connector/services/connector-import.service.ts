import {inject, Injectable} from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import {
  catchError,
  concat,
  defer,
  EMPTY,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  of,
  retry,
  Subject,
  takeUntil,
  timer,
} from 'rxjs';
import {SseClient} from 'ngx-sse-client';
import {environment} from '@local-app/env/environment';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';
import {ImportEventDTO, ImportProgressDTO} from '../dto/import-progress';
import {ImportStreamMessage, ImportUploadSettings} from '../dto/connector-import';

@Injectable({providedIn: 'root'})
export class ConnectorImportService {

  private readonly http = inject(HttpClient);
  private readonly sseClient = inject(SseClient);

  private readonly baseUrl = `${environment.localLearningAPIURL}/connectors/files`;


  importStream(
    cohortId: number,
    file: File,
    settings: ImportUploadSettings | undefined,
    connectorId: number | undefined,
    importId: string,
  ): Observable<ImportStreamMessage> {
    const form = new FormData();
    form.append('file', file);
    if (settings) {
      form.append(
        'settings',
        new Blob([JSON.stringify(settings)], {type: 'application/json'}),
        'settings.json',
      );
    }

    let params = new HttpParams().set('importId', importId);
    if (connectorId !== undefined) {
      params = params.set('connectorId', connectorId);
    }

    const request = new HttpRequest<FormData>(
      'POST',
      `${this.baseUrl}/cohorts/${cohortId}/files`,
      form,
      {
        params,
        headers: new HttpHeaders().set(SKIP_LOADING, 'true').set('Accept', 'application/json'),
        reportProgress: true,
        responseType: 'json',
      },
    );

    return defer(() => {
      let following = false;
      const stopFollowing = new Subject<void>();

      return this.http.request(request).pipe(
        mergeMap((event: HttpEvent<unknown>) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? file.size;
            const loaded = event.loaded ?? 0;
            const uploadMessage: ImportStreamMessage = {
              kind: 'upload',
              loaded,
              total,
              percent: total > 0 ? Math.round((100 * loaded) / total) : 0,
            };

            if (!following && total > 0 && loaded >= total) {
              following = true;
              return concat(
                of(uploadMessage),
                this.followImportWhenReady(importId).pipe(takeUntil(stopFollowing)),
              );
            }
            return of(uploadMessage);
          }
          if (event.type === HttpEventType.ResponseHeader && !following) {
            following = true;
            return this.followImportWhenReady(importId).pipe(takeUntil(stopFollowing));
          }
          if (event.type === HttpEventType.Response) {
            stopFollowing.next();
            stopFollowing.complete();
            if (Array.isArray(event.body)) {
              return from(event.body.map((item) => ({
                kind: 'event',
                event: item as ImportEventDTO,
              } as ImportStreamMessage)));
            }
          }
          return EMPTY;
        }),
        finalize(() => {
          stopFollowing.next();
          stopFollowing.complete();
        }),
      );
    });
  }


  followImport(importId: string): Observable<ImportStreamMessage> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.sseClient
      .stream(
        `${this.baseUrl}/imports/${importId}/events`,
        {keepAlive: false, responseType: 'event'},
        {headers},
        'GET',
      )
      .pipe(
        map((event: Event) => {
          if (event.type === 'error') {
            const errorEvent = event as ErrorEvent;
            throw errorEvent.error ?? new Error(errorEvent.message || 'SSE connection error');
          }

          const data = (event as MessageEvent).data;
          const importEvent = typeof data === 'string'
            ? JSON.parse(data) as ImportEventDTO
            : data as ImportEventDTO;
          return {kind: 'event', event: importEvent} as ImportStreamMessage;
        }),
      );
  }

  private followImportWhenReady(importId: string): Observable<ImportStreamMessage> {
    return defer(() => this.followImport(importId)).pipe(
      // Upload completion can precede creation of the backend progress tracker by a short time.
      retry({count: 120, delay: () => timer(500)}),
      // The POST still carries the terminal result, so losing the optional live view must not fail it.
      catchError(() => EMPTY),
    );
  }

  getImport(importId: string): Observable<ImportProgressDTO> {
    return this.http.get<ImportProgressDTO>(`${this.baseUrl}/imports/${importId}`,
      {headers: new HttpHeaders().set(SKIP_LOADING, 'true')});
  }

  getImports(cohortId: number, connectorId?: number): Observable<ImportProgressDTO[]> {
    let params = new HttpParams();
    if (connectorId !== undefined) {
      params = params.set('connectorId', connectorId);
    }
    return this.http.get<ImportProgressDTO[]>(`${this.baseUrl}/cohorts/${cohortId}/imports`,
      {headers: new HttpHeaders().set(SKIP_LOADING, 'true'), params});
  }

}

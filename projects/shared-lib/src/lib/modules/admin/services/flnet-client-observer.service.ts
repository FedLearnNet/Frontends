import {inject, Injectable} from '@angular/core';
import {HttpHeaders} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {catchError} from 'rxjs/operators';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {ApiService} from '@shared-lib/services/api.service';
import {SseClient} from 'ngx-sse-client';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';
import {FLNetClientObserverEventDTO} from '../dto/observer';

@Injectable({providedIn: 'root'})
export class FLNetClientObserverService {
  private readonly apiService = inject(ApiService);
  private readonly sseClient = inject(SseClient);
  private readonly translate = inject(TranslateService);
  private readonly errorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;

  private readonly path = 'admin/observer/client';

  private baseUrl(): string {
    if (this.localApiURL) {
      return `${this.localApiURL}/${this.path}`;
    }
    return `${this.globalApiURL}/${this.path}`;
  }

  isEnabled(): Observable<boolean> {
    return this.apiService
      .get<boolean>(`${this.baseUrl()}/enabled`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'observer status'})
          )
        )
      );
  }

  getConnectedClients(): Observable<string[]> {
    return this.apiService
      .get<string[]>(`${this.baseUrl()}/clients`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'connected clients'})
          )
        )
      );
  }

  removeAllClients(): Observable<void> {
    return this.apiService
      .delete<void>(`${this.baseUrl()}/clients`)
      .pipe(
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAIELD_DELETE', {name: 'Remove connections failed'})
          )
        )
      );
  }

  streamEvents(): Observable<FLNetClientObserverEventDTO> {
    const url = `${this.baseUrl()}/events`;
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.sseClient
      .stream(url, {keepAlive: false, responseType: 'event'}, {headers}, 'GET')
      .pipe(
        map((event: Event) => {
          if (event.type === 'error') {
            const errorEvent = event as ErrorEvent;
            throw errorEvent.error ?? new Error(errorEvent.message || 'SSE connection error');
          }
          const messageEvent = event as MessageEvent;
          const data = typeof messageEvent.data === 'string'
            ? JSON.parse(messageEvent.data)
            : messageEvent.data;
          return data as FLNetClientObserverEventDTO;
        }),
        catchError(err =>
          this.errorSnackbarService.showSnackBar(
            err,
            this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'observer events'})
          )
        )
      );
  }
}

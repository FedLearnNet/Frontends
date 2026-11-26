import {inject, Injectable} from '@angular/core';
import {HttpHeaders, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {SseClient} from 'ngx-sse-client';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';
import {MaintenanceDTO, MaintenanceMode} from '../dto/maintenance';

@Injectable({providedIn: 'root'})
export class MaintenanceService {
  private readonly sseClient = inject(SseClient);
  private readonly url = `${e1.localLearningAPIURL || e2.globalLearningApiUrl}/admin/maintenance`;
  readonly isPlatform = !e1.localLearningAPIURL;

  load(): Observable<MaintenanceDTO> {
    return this.stream(this.url, 'GET');
  }

  start(mode: MaintenanceMode, version?: string, all = false, backup?: string): Observable<MaintenanceDTO> {
    let params = new HttpParams().set('all', all);
    if (version) {
      params = params.set('version', version);
    }
    if (backup) {
      params = params.set('backup', backup);
    }
    return this.stream(`${this.url}/${mode}`, 'POST', params);
  }

  private stream(url: string, method: 'GET' | 'POST', params?: HttpParams): Observable<MaintenanceDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(url, {keepAlive: false, responseType: 'event'}, {headers, params}, method).pipe(
      map((event: Event) => {
        if (event.type === 'error') {
          const error = event as ErrorEvent;
          throw error.error ?? new Error(error.message || 'Connection lost');
        }
        return JSON.parse((event as MessageEvent).data) as MaintenanceDTO;
      })
    );
  }
}

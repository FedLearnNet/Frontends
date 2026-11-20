import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';
import {SseClient} from 'ngx-sse-client';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';
import {environment} from '@local-app/env/environment';
import {ConnectorDTO} from '../dto/connector';
import {TransformerAssistantMessageDTO} from '../dto/transformer-assistant';

const CONNECTOR_ASSISTANT_PATH = '/connectors/transformer-assistant';

/**
 * Follows an assistant run in the background over server-sent events; messages go as separate requests.
 * Each request is authenticated by the refreshed session cookie, so a run outlasts the access token.
 */
@Injectable({providedIn: 'root'})
export class TransformerAssistantStreamService {
  private readonly http = inject(HttpClient);
  private readonly sseClient = inject(SseClient);
  private messagesUrl?: string;

  /** Follows the run of a path, e.g. of a harmonization, or starts a run for the connector, which ends when unsubscribed. */
  connect(connector: ConnectorDTO, path?: string): Observable<TransformerAssistantMessageDTO> {
    this.messagesUrl = undefined;
    const started = path
      ? this.http.post<void>(this.url(path), {}).pipe(map(() => path))
      : this.http.post<{id: string}>(this.url(CONNECTOR_ASSISTANT_PATH), connector)
        .pipe(map(run => `${CONNECTOR_ASSISTANT_PATH}/${run.id}`));
    return started.pipe(switchMap(runPath => {
      this.messagesUrl = `${this.url(runPath)}/messages`;
      return this.follow(this.url(runPath));
    }));
  }

  private follow(url: string): Observable<TransformerAssistantMessageDTO> {
    return this.sseClient.stream(url, {keepAlive: false, responseType: 'event'}, {headers: new HttpHeaders().set(SKIP_LOADING, 'true')}, 'GET').pipe(
      map((event: Event) => {
        if (event.type === 'error') {
          throw (event as ErrorEvent).error ?? new Error('The connection to the transformer assistant was closed');
        }
        return JSON.parse((event as MessageEvent).data);
      }),
    );
  }

  send(message: TransformerAssistantMessageDTO): void {
    if (this.messagesUrl) {
      this.http.post<void>(this.messagesUrl, message).subscribe();
    }
  }

  private url(path: string): string {
    return `${environment.localLearningAPIURL ?? ''}${path}`;
  }
}

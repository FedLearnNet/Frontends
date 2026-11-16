import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';
import {SseClient} from 'ngx-sse-client';
import {SKIP_LOADING} from '@shared-lib/interceptors/loading.interceptor';
import {environment} from '@local-app/env/environment';
import {ConnectorDTO} from '../dto/connector';
import {TransformerAssistantMessageDTO, TransformerAssistantMessageType} from '../dto/transformer-assistant';

const WEBSOCKET_PATH = '/connectors/transformer-assistant';

@Injectable({providedIn: 'root'})
export class TransformerAssistantSocketService {
  private readonly http = inject(HttpClient);
  private readonly sseClient = inject(SseClient);
  private socket?: WebSocket;
  private messagesUrl?: string;


  connect(connector: ConnectorDTO, path?: string): Observable<TransformerAssistantMessageDTO> {
    this.messagesUrl = path && `${environment.localLearningAPIURL ?? ''}${path}/messages`;
    if (path) {
      return this.follow(`${environment.localLearningAPIURL ?? ''}${path}`);
    }
    return this.open(connector);
  }

  private follow(url: string): Observable<TransformerAssistantMessageDTO> {
    return this.http.post<void>(url, {}).pipe(
      switchMap(() => this.sseClient.stream(url, {keepAlive: false, responseType: 'event'}, {headers: new HttpHeaders().set(SKIP_LOADING, 'true')}, 'GET')),
      map((event: Event) => {
        if (event.type === 'error') {
          throw (event as ErrorEvent).error ?? new Error('The connection to the transformer assistant was closed');
        }
        return JSON.parse((event as MessageEvent).data);
      }),
    );
  }

  private open(connector: ConnectorDTO): Observable<TransformerAssistantMessageDTO> {
    return new Observable(subscriber => {
      // The BFF session cookie authenticates the upgrade
      const socket = new WebSocket(this.url(WEBSOCKET_PATH));
      this.socket = socket;

      let disposed = false;

      socket.onopen = () => this.send({type: TransformerAssistantMessageType.START, connector});
      socket.onmessage = event => subscriber.next(JSON.parse(event.data));
      socket.onerror = () => subscriber.error(new Error('Connection to the transformer assistant failed'));
      // Closed by the server, the run and its results are gone, so applying them would silently do nothing
      socket.onclose = event => disposed
        ? subscriber.complete()
        : subscriber.error(new Error(`The connection to the transformer assistant was closed (${event.code}${event.reason ? ': ' + event.reason : ''})`));

      return () => {
        disposed = true;
        if (socket.readyState <= WebSocket.OPEN) {
          socket.close(1000, 'client_dispose');
        }
        if (this.socket === socket) {
          this.socket = undefined;
        }
      };
    });
  }

  send(message: TransformerAssistantMessageDTO): void {
    if (this.messagesUrl) {
      this.http.post<void>(this.messagesUrl, message).subscribe();
    } else if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private url(path: string): string {
    const url = new URL(`${environment.localLearningAPIURL ?? ''}${path}`, window.location.origin);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  }
}

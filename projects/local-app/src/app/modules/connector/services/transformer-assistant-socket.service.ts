import {inject, Injectable} from '@angular/core';
import {from, Observable, switchMap} from 'rxjs';
import Keycloak from 'keycloak-js';
import {KeycloakSessionService} from '@shared-lib/services/keycloak-session.service';
import {environment} from '@local-app/env/environment';
import {ConnectorDTO} from '../dto/connector';
import {TransformerAssistantMessageDTO, TransformerAssistantMessageType} from '../dto/transformer-assistant';

/** A run that builds custom code takes longer than an access token lives, so the token is renewed while it runs. */
const TOKEN_REFRESH_MS = 60_000;

@Injectable({providedIn: 'root'})
export class TransformerAssistantSocketService {
  private readonly keycloak = inject(Keycloak);
  private readonly sessionService = inject(KeycloakSessionService);
  private socket?: WebSocket;

  connect(connector: ConnectorDTO): Observable<TransformerAssistantMessageDTO> {
    // The WebSocket upgrade passes no HTTP interceptor, so the token is refreshed here before it is sent
    return from(this.sessionService.ensureValidSession(this.keycloak)).pipe(
      switchMap(() => this.open(connector)),
    );
  }

  private open(connector: ConnectorDTO): Observable<TransformerAssistantMessageDTO> {
    return new Observable(subscriber => {
      const authorization = encodeURIComponent(`quarkus-http-upgrade#Authorization#Bearer ${this.keycloak.token}`);
      const socket = new WebSocket(this.url(), ['bearer-token-carrier', authorization]);
      this.socket = socket;

      let disposed = false;
      let sentToken = this.keycloak.token;
      const refresh = setInterval(() => {
        this.sessionService.ensureValidSession(this.keycloak).then(() => {
          if (this.keycloak.token && this.keycloak.token !== sentToken) {
            sentToken = this.keycloak.token;
            this.send({type: TransformerAssistantMessageType.TOKEN, message: sentToken});
          }
        }).catch(() => undefined);
      }, TOKEN_REFRESH_MS);

      socket.onopen = () => this.send({type: TransformerAssistantMessageType.START, connector});
      socket.onmessage = event => subscriber.next(JSON.parse(event.data));
      socket.onerror = () => subscriber.error(new Error('Connection to the transformer assistant failed'));
      // Closed by the server, the run and its results are gone, so applying them would silently do nothing
      socket.onclose = event => disposed
        ? subscriber.complete()
        : subscriber.error(new Error(`The connection to the transformer assistant was closed (${event.code}${event.reason ? ': ' + event.reason : ''})`));

      return () => {
        disposed = true;
        clearInterval(refresh);
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
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private url(): string {
    const url = new URL(`${environment.localLearningAPIURL ?? ''}/connectors/transformer-assistant`, window.location.origin);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.toString();
  }
}

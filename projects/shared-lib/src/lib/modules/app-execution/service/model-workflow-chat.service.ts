import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {ModelWorkflowChatWrapperDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {getConfigWSUrl} from "@global-app/utils/ws-url-helper";

@Injectable({providedIn: 'root'})
export class ChatWebSocketService {
  private socket?: WebSocket;

  private incoming$ = new Subject<ModelWorkflowChatWrapperDTO>();
  private opened$ = new Subject<void>();
  private closed$ = new Subject<void>();
  private errored$ = new Subject<any>();

  private urlBase = getConfigWSUrl();

  connect(workflowId: number): void {
    this.disconnect();
    const url = `${this.urlBase}/model/workflow/${workflowId}/chat`;
    const ws = (this.socket = new WebSocket(url));

    ws.onopen = () => this.opened$.next();
    ws.onclose = () => this.closed$.next();
    ws.onerror = (ev) => this.errored$.next(ev);
    ws.onmessage = (ev) => {
      try {
        const wrapper = JSON.parse(ev.data) as ModelWorkflowChatWrapperDTO;
        this.incoming$.next(wrapper);
      } catch (e) {
        this.errored$.next(e);
      }
    };
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState <= 1) this.socket.close(1000, 'client_dispose');
    this.socket = undefined;
  }

  sendChatMessage(msg: string): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(msg);
  }

  opened(): Observable<void> {
    return this.opened$.asObservable();
  }

  closed(): Observable<void> {
    return this.closed$.asObservable();
  }

  errored(): Observable<any> {
    return this.errored$.asObservable();
  }

  messages(): Observable<ModelWorkflowChatWrapperDTO> {
    return this.incoming$.asObservable();
  }
}

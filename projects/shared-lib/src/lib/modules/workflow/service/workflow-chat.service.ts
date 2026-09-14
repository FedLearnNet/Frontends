import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {WorkflowChatMessageDTO} from "@shared-lib/modules/workflow/dto/workflow-chat";
import {getConfigWSUrl} from "@global-app/utils/ws-url-helper";

@Injectable({providedIn: 'root'})
export class WorkflowChatWebSocketService {
  private socket?: WebSocket;

  private incoming$ = new Subject<WorkflowChatMessageDTO>();
  private opened$ = new Subject<void>();
  private closed$ = new Subject<void>();
  private errored$ = new Subject<any>();

  private urlBase = getConfigWSUrl();

  connect(workflowId: number): void {
    this.disconnect();
    const url = `${this.urlBase}/workflow/${workflowId}/chat`;
    const ws = (this.socket = new WebSocket(url));

    ws.onopen = () => this.opened$.next();
    ws.onclose = () => this.closed$.next();
    ws.onerror = (ev) => this.errored$.next(ev);
    ws.onmessage = (ev) => {
      try {
        const wrapper = JSON.parse(ev.data) as WorkflowChatMessageDTO;
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

  messages(): Observable<WorkflowChatMessageDTO> {
    return this.incoming$.asObservable();
  }
}

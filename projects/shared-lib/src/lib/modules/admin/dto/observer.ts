export type FLNetClientObserverEventType = 'CONNECTED' | 'DISCONNECTED' | 'MESSAGE_RECEIVED' | 'MESSAGE_SENT';

export interface FLNetClientObserverEventDTO {
  connectionId: string;
  type: FLNetClientObserverEventType;
  messageType: string | null;
  payload: unknown;
  timestamp: string;
}

import {BaseChatMessageDTO} from "@shared-lib/modules/app-execution/dto/chat";
import {ConnectorDTO, ConnectorTransformerDTO} from "./connector";

export enum TransformerAssistantMessageType {
  START = 'START',
  USER_MESSAGE = 'USER_MESSAGE',
  STOP = 'STOP',
  /** A refreshed access token in message; the server closes the connection when the old one expires. */
  TOKEN = 'TOKEN',
  APPLY = 'APPLY',
  APPLIED = 'APPLIED',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  NODE_PENDING = 'NODE_PENDING',
  NODE_STARTED = 'NODE_STARTED',
  NODE_RESULT = 'NODE_RESULT',
  PATIENT_ID = 'PATIENT_ID',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export interface ConnectorSelectedTransformerDTO {
  selectedTransformers?: ConnectorTransformerDTO[];
  mappedColumn?: string | null;
  foundTransformer: boolean;
  neededTransformerFunction?: string | null;
}

/** The columns that tell the rows of one patient apart, when a patient has several rows. */
export interface VisitMappingDTO {
  visitIdMapping?: string | null;
  visitTimestampMapping?: string | null;
  timestampFormat?: string | null;
}

export interface TransformerAssistantMessageDTO {
  type: TransformerAssistantMessageType;
  connector?: ConnectorDTO;
  message?: string;
  chatMessage?: BaseChatMessageDTO;
  schemaId?: number;
  mappingPath?: string;
  selectedTransformer?: ConnectorSelectedTransformerDTO;
  visitMapping?: VisitMappingDTO | null;
  /** Who asked a question, e.g. patientId, selectColumns, selectTransformer or writeTransformer. */
  agent?: string | null;
  schemaIds?: number[];
  /** The selected columns: the answer to a column question, or the patient id column of PATIENT_ID. */
  columns?: string[];
}

export type TransformerAssistantNodeStatus = 'PENDING' | 'RUNNING' | 'DONE';

export interface TransformerAssistantNode {
  schemaId: number;
  mappingPath: string;
  status: TransformerAssistantNodeStatus;
  selectedTransformer?: ConnectorSelectedTransformerDTO;
  visitMapping?: VisitMappingDTO | null;
}

export interface TransformerAssistantProgress {
  done: number;
  total: number;
  direct: number;
  transformed: number;
  notFound: number;
}

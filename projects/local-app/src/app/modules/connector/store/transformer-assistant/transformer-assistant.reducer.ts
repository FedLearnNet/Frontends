import {createFeature, createReducer, createSelector, on} from '@ngrx/store';
import {BaseChatMessageDTO, HumanInTheLoopDTO} from '@shared-lib/modules/app-execution/dto/chat';
import {
  TransformerAssistantMessageDTO,
  TransformerAssistantMessageType,
  TransformerAssistantNode,
  TransformerAssistantNodeStatus,
  TransformerAssistantProgress
} from '../../dto/transformer-assistant';
import {TransformerAssistantActions} from './transformer-assistant.actions';
import {ConnectorDTO} from '../../dto/connector';

export type TransformerAssistantStatus = 'IDLE' | 'RUNNING' | 'DONE' | 'STOPPED' | 'ERROR';

export interface TransformerAssistantState {
  status: TransformerAssistantStatus;
  error: string | null;
  messages: BaseChatMessageDTO[];
  nodes: TransformerAssistantNode[];
  patientIdColumn: string | null;
  applied: ConnectorDTO | null;
  /** Chat message id -> the agent that asked it, e.g. patientId or writeTransformer. */
  agents: Record<number, string>;
  /** Found nodes the user took out of the suggestion; everything else found is applied. */
  excluded: number[];
}

const initialState: TransformerAssistantState = {
  status: 'IDLE', error: null, messages: [], nodes: [], patientIdColumn: null, applied: null, agents: {}, excluded: [],
};

const NODE_STATUS: Partial<Record<TransformerAssistantMessageType, TransformerAssistantNodeStatus>> = {
  [TransformerAssistantMessageType.NODE_PENDING]: 'PENDING',
  [TransformerAssistantMessageType.NODE_STARTED]: 'RUNNING',
  [TransformerAssistantMessageType.NODE_RESULT]: 'DONE',
};

function progress(nodes: TransformerAssistantNode[]): TransformerAssistantProgress {
  const done = nodes.filter(node => node.status === 'DONE');
  const found = done.filter(node => node.selectedTransformer?.foundTransformer);
  const transformed = found.filter(node => (node.selectedTransformer?.selectedTransformers ?? []).length > 0).length;
  return {
    done: done.length,
    total: nodes.length,
    direct: found.length - transformed,
    transformed,
    notFound: done.length - found.length,
  };
}

function pendingQuestion(messages: BaseChatMessageDTO[]): HumanInTheLoopDTO | null {
  return messages
    .filter(message => !message.done)
    .flatMap(message => message.humanInTheLoop ?? [])
    .find(question => !question.answer) ?? null;
}

function pendingAgent(messages: BaseChatMessageDTO[], agents: Record<number, string>): string | null {
  const message = messages.find(candidate => !candidate.done
    && (candidate.humanInTheLoop ?? []).some(question => !question.answer));
  return message ? agents[message.id] ?? null : null;
}

function waitingForAnswer(messages: BaseChatMessageDTO[]): boolean {
  return pendingQuestion(messages) !== null;
}

function upsert<T>(items: T[], item: T, matches: (candidate: T) => boolean): T[] {
  const index = items.findIndex(matches);
  return index < 0 ? [...items, item] : items.map((candidate, i) => i === index ? item : candidate);
}

function receive(state: TransformerAssistantState, message: TransformerAssistantMessageDTO): TransformerAssistantState {
  switch (message.type) {
    case TransformerAssistantMessageType.CHAT_MESSAGE:
      return {
        ...state,
        messages: upsert(state.messages, message.chatMessage!, m => m.id === message.chatMessage!.id),
        agents: message.agent ? {...state.agents, [message.chatMessage!.id]: message.agent} : state.agents,
      };
    case TransformerAssistantMessageType.NODE_PENDING:
    case TransformerAssistantMessageType.NODE_STARTED:
    case TransformerAssistantMessageType.NODE_RESULT: {
      const node: TransformerAssistantNode = {
        schemaId: message.schemaId!,
        mappingPath: message.mappingPath!,
        status: NODE_STATUS[message.type] ?? 'PENDING',
        selectedTransformer: message.selectedTransformer,
        visitMapping: message.visitMapping,
      };
      return {...state, nodes: upsert(state.nodes, node, n => n.schemaId === node.schemaId)};
    }
    case TransformerAssistantMessageType.PATIENT_ID:
      return {...state, patientIdColumn: message.columns?.[0] ?? null};
    case TransformerAssistantMessageType.APPLIED:
      return {...state, applied: message.connector ?? null};
    case TransformerAssistantMessageType.DONE:
      return {...state, status: 'DONE'};
    case TransformerAssistantMessageType.ERROR:
      return {...state, status: 'ERROR', error: message.message ?? null};
    default:
      return state;
  }
}

export const transformerAssistantFeature = createFeature({
  name: 'transformerAssistant',
  reducer: createReducer(
    initialState,
    on(TransformerAssistantActions.start, (): TransformerAssistantState => ({...initialState, status: 'RUNNING'})),
    on(TransformerAssistantActions.received, (state, {message}): TransformerAssistantState => receive(state, message)),
    on(TransformerAssistantActions.connectionFailed, (state, {error}): TransformerAssistantState =>
      ({...state, status: 'ERROR', error})),
    on(TransformerAssistantActions.sendMessage, (state, {message}): TransformerAssistantState =>
      waitingForAnswer(state.messages) ? state : {
        ...state,
        messages: [...state.messages, {
          id: -Date.now(), message, request: true, done: true, createdAt: new Date(),
        } as BaseChatMessageDTO],
      }),
    on(TransformerAssistantActions.stop, (state): TransformerAssistantState =>
      ({...state, status: state.status === 'RUNNING' ? 'STOPPED' : state.status})),
    on(TransformerAssistantActions.toggleNode, (state, {schemaId}): TransformerAssistantState => ({
      ...state,
      excluded: state.excluded.includes(schemaId)
        ? state.excluded.filter(id => id !== schemaId)
        : [...state.excluded, schemaId],
    })),
    on(TransformerAssistantActions.reset, (): TransformerAssistantState => initialState),
  ),
  extraSelectors: ({selectMessages, selectNodes, selectAgents, selectExcluded}) => ({
    selectWaitingForAnswer: createSelector(selectMessages, waitingForAnswer),
    selectPendingQuestion: createSelector(selectMessages, pendingQuestion),
    selectPendingAgent: createSelector(selectMessages, selectAgents, pendingAgent),
    selectFoundNodes: createSelector(selectNodes, nodes => nodes.filter(node => node.selectedTransformer?.foundTransformer)),
    selectNodesToApply: createSelector(selectNodes, selectExcluded, (nodes, excluded) => nodes.filter(node =>
      node.selectedTransformer?.foundTransformer && !excluded.includes(node.schemaId))),
    selectProgress: createSelector(selectNodes, progress),
    selectCurrentNode: createSelector(selectNodes, nodes => nodes.find(node => node.status === 'RUNNING') ?? null),
  }),
});

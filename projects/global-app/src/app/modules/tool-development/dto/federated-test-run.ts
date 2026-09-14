import {RunStatusTypes} from "./test-run";
import {BaseDto} from "@shared-lib/base/base-dto";

export enum FLNetParticipantRole {
  CLIENT = 'CLIENT',
  AGGREGATOR = 'AGGREGATOR'
}

export type FederatedRoundDirection = 'SEND' | 'RECEIVE';

/*
export interface FederatedParticipantLocalConfigDTO {
//MAYBE FUTURE
}
*/
export interface FederatedTestRunConfigDTO {
  pollInterval?: number;
  timeout?: number;
  maxPolls?: number;
  useContainerizedController?: boolean;
}


export interface FederatedTestRunCreateDTO {
  federatedAppVersionId?: number;
  totalRounds?: number;
  startAggregator?: boolean;
  config?: FederatedTestRunConfigDTO;
  participants: FederatedParticipantConfigDTO[];
}

export interface FederatedParticipantConfigDTO {
  participantId: string;
  role: FLNetParticipantRole;
  //config?: FederatedParticipantLocalConfigDTO;
  hyperParams?: { [key: string]: any };
  inputFilePaths?: { [key: string]: string };
}


export interface FederatedTestRunDTO extends BaseDto {
  status?: RunStatusTypes;
  error?: string;
  currentRound?: number;
  totalRounds?: number;
  startAggregator?: boolean;
  config?: FederatedTestRunConfigDTO;
  outputData?: { [key: string]: any };
  federatedAppId?: number;
  federatedAppVersionId?: number;
  federatedAppVersionName?: string;
  participants?: FederatedParticipantDTO[];
  roundMessages?: FederatedRoundMessageDTO[];
}

export interface FederatedParticipantDTO extends BaseDto {
  federatedRunId?: number;
  participantId: string;
  role: FLNetParticipantRole;
  status?: RunStatusTypes;
  hyperParams?: { [key: string]: any };
  inputFilePaths?: { [key: string]: string };
  // config?: FederatedParticipantLocalConfigDTO;
  currentRound?: number;
  messagesReceived?: number;
  messagesSent?: number;
  waitingFor?: string[];
}


export interface FederatedRoundMessageDTO extends BaseDto {
  federatedRunId?: number;
  direction: FederatedRoundDirection | string;
  round?: number;
  fromParticipant?: string;
  toParticipant?: string;
  communicationId?: string;
  payloadPreview?: string;
}

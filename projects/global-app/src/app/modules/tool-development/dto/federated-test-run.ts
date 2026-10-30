
export enum FLNetParticipantRole {
  CLIENT = 'CLIENT',
  AGGREGATOR = 'AGGREGATOR'
}

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

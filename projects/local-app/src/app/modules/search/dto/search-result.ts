export enum SearchResultType {
  QUERY = 'QUERY',
  COHORT = 'COHORT',
  PATIENT = 'PATIENT',
  SCHEMA = 'SCHEMA',
  TRAINING_REQUEST = 'TRAINING_REQUEST',
  STATISTICS_REQUEST = 'STATISTICS_REQUEST',
  METRIC_REQUEST = 'METRIC_REQUEST',
  TRAINING = 'TRAINING',
  LOG = 'LOG',
  CONNECTOR = 'CONNECTOR',
}

export interface SearchResultEntity {
  id?: number | string;
  cohortId?: number | string;
  globalId?: string;
  nodeType?: string;

  [key: string]: any;
}


export interface SearchResultDTO<T extends SearchResultEntity = SearchResultEntity> {
  type: SearchResultType;
  result: T;
  title: string;
  score: number;
}

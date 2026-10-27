import {BaseDto} from "@shared-lib/base/base-dto";
import {Lang2Group} from "@global-app/find-data/dto/lang2-query";

export enum QueryOperatorTypes {
  EQUAL = 'EQUAL',
  SMALLER = 'SMALLER',
  SMALLER_EQUAL = 'SMALLER_EQUAL',
  BIGGER = 'BIGGER',
  BIGGER_EQUAL = 'BIGGER_EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  EXISTS = 'EXISTS',
  NOT_EXISTS = 'NOT_EXISTS',
  REGEX = 'REGEX',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  START_WIDTH = 'START_WIDTH',
  END_WIDTH = 'END_WIDTH',
  HAS_CHANGED = 'HAS_CHANGED',
  CHANGED_FROM = 'CHANGED_FROM',
  CHANGED_TO = 'CHANGED_TO',
}

export interface QueryOperatorDTO {
  operator: QueryOperatorTypes;
  value: string | string[];
}

export interface QueryItemDTO {
  ontologyId: string;
  dataTypeId: string;
  operator: QueryOperatorDTO[];
}

export interface EnhancedQueryItemDTO extends QueryItemDTO {
  ontologyName?: string;
}

export interface CreateQueryDTO {
  query: Lang2Group;
  description: string;
  name: string;
  groupId?: string;
}


export interface QueryDTO extends BaseDto {
  query: Lang2Group;
  description: string;
  name: string;
  globalUniqueId: string;
  groupId: string;
  result: number;
  hasResult: boolean;

  hasFired: boolean;
  keycloakId: string;

  projectIds?: number[];
  latestDataStatisticsRequest?: string;
  latestDataStatisticsRequestTimestamp?: Date;
}

export interface QueryDetailDTO extends QueryDTO {
  enhancedQuery?: EnhancedQueryItemDTO[];
  olderQueries?: QueryDTO[];
}

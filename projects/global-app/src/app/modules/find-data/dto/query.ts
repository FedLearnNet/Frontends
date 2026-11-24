import {BaseDto} from "@shared-lib/base/base-dto";
import {QueryGroupDTO, QueryLeafDTO} from "@global-app/find-data/dto/query-item";

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

// leaf of a stored query with catalog names resolved
export interface EnhancedQueryItemDTO extends QueryLeafDTO {
  ontologyName?: string;
  dataTypeName?: string;
}

export interface CreateQueryDTO {
  query: QueryGroupDTO;
  description: string;
  name: string;
  groupId?: string;
}


export interface QueryDTO extends BaseDto {
  query: QueryGroupDTO;
  description: string;
  name: string;
  globalUniqueId: string;
  groupId: string;
  result: number | null;
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

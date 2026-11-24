import {QueryOperatorTypes} from '@global-app/find-data/dto/query';


export type ConnectingOperator = 'AND' | 'OR';

export type ValueModeDTO = 'ABSOLUTE' | 'DELTA';

export type TimeAggregationMethod = 'NONE' | 'FIRST' | 'LAST' | 'WITHIN' | 'WITHIN_AT_LEAST' | 'WITHIN_AT_MOST';

export type ValueAggregationMethod = 'NONE' | 'AVERAGE';

export type TemporalRelationship =
  | 'WITHIN'
  | 'IN_THE_FOLLOWING'
  | 'SAME_TIME'
  | 'ANYTIME_AFTER'
  | 'SAME_VISIT'
  | 'SAME_GROUP';

export type IntervalUnitDTO = 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';

export interface IntervalPartDTO {
  count: number;
  unit: IntervalUnitDTO;
}

// ISO dates, both exclusive; no filter means anytime
export interface TimeFilterDTO {
  after?: string;
  before?: string;
}

// indexes are zero-based into the group's conditions
export interface TemporalRelationDTO {
  sourceCondition: number;
  targetCondition: number;
  relationship: TemporalRelationship;
  interval?: IntervalPartDTO[];
  atLeast?: number;
  atMost?: number;
}

export interface QueryLeafDTO {
  ontologyId: string;
  dataTypeId: string;
  operator: QueryOperatorTypes;
  value?: string | number;
  valueMode?: ValueModeDTO;
  deltaInterval?: IntervalPartDTO[];
  timeFilter?: TimeFilterDTO;
  timeAggregationMethod?: TimeAggregationMethod;
  timeWindow?: IntervalPartDTO[];
  timeWindowCount?: number;
  valueAggregationMethod?: ValueAggregationMethod;
  atLeast?: number;
  atMost?: number;
}

export interface QueryGroupDTO {
  connectingOperator: ConnectingOperator;
  conditions: QueryNodeDTO[];
  temporalRelations?: TemporalRelationDTO[];
}

export type QueryNodeDTO = QueryGroupDTO | QueryLeafDTO;

export function isQueryGroup(value: unknown): value is QueryGroupDTO {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<QueryGroupDTO>;
  return (candidate.connectingOperator === 'AND' || candidate.connectingOperator === 'OR')
    && Array.isArray(candidate.conditions);
}

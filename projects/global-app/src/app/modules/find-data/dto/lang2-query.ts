export type ConnectingOperator = '$and' | '$or';

export type Lang2Operator =
  | '='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'exists'
  | '!exists'
  | 'in'
  | '!in'
  | 'contains'
  | '!contains'
  | 'startsWith'
  | 'endsWith'
  | 'regex'
  | 'has_changed'
  | 'changed_from'
  | 'changed_to';

export type DatatypeHint = 'String' | 'Integer' | 'Float' | 'Boolean';

export type ValueAggregationMethod = 'None' | 'average';

export interface Lang2TimeFilter {
  after?: string;
  before?: string;
}

export interface Lang2TemporalRelation {
  source_condition: number;
  target_condition: number;
  relationship: string;
  at_least?: number;
  at_most?: number;
}

export interface Lang2Leaf {
  ontology_id: string;
  data_type_id: string;
  operator: Lang2Operator;
  value_mode: string;
  time_aggregation_method: string;
  value_aggregation_method: ValueAggregationMethod;
  value?: string | number;
  datatype?: DatatypeHint;
  time_filter?: 'anytime' | Lang2TimeFilter;
  at_least?: number;
  at_most?: number;
}

export interface Lang2Group {
  connecting_operator: ConnectingOperator;
  conditions: Lang2Node[];
  temporal_relations?: Lang2TemporalRelation[];
}

export type Lang2Node = Lang2Group | Lang2Leaf;

export function isLang2Group(value: unknown): value is Lang2Group {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Lang2Group>;
  return (candidate.connecting_operator === '$and' || candidate.connecting_operator === '$or')
    && Array.isArray(candidate.conditions);
}

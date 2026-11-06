import {QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {Lang2Operator} from '@global-app/find-data/dto/lang2-query';
import {
  QueryLeafNode,
  RelationKind,
  TimeAggregation,
  ValueMode,
} from '@global-app/find-data/models/query-tree';

const CHANGE_OPERATORS = new Set<QueryOperatorTypes>([
  QueryOperatorTypes.HAS_CHANGED,
  QueryOperatorTypes.CHANGED_FROM,
  QueryOperatorTypes.CHANGED_TO,
]);

export const OPERATOR_TO_WIRE: Record<QueryOperatorTypes, Lang2Operator> = {
  [QueryOperatorTypes.EQUAL]: '=',
  [QueryOperatorTypes.NOT_EQUAL]: '!=',
  [QueryOperatorTypes.BIGGER]: '>',
  [QueryOperatorTypes.SMALLER]: '<',
  [QueryOperatorTypes.BIGGER_EQUAL]: '>=',
  [QueryOperatorTypes.SMALLER_EQUAL]: '<=',
  [QueryOperatorTypes.EXISTS]: 'exists',
  [QueryOperatorTypes.NOT_EXISTS]: '!exists',
  [QueryOperatorTypes.IN]: 'in',
  [QueryOperatorTypes.NOT_IN]: '!in',
  [QueryOperatorTypes.CONTAINS]: 'contains',
  [QueryOperatorTypes.NOT_CONTAINS]: '!contains',
  [QueryOperatorTypes.START_WIDTH]: 'startsWith',
  [QueryOperatorTypes.END_WIDTH]: 'endsWith',
  [QueryOperatorTypes.REGEX]: 'regex',
  [QueryOperatorTypes.HAS_CHANGED]: 'has_changed',
  [QueryOperatorTypes.CHANGED_FROM]: 'changed_from',
  [QueryOperatorTypes.CHANGED_TO]: 'changed_to',
};

const WIRE_TO_OPERATOR = Object.fromEntries(
  Object.entries(OPERATOR_TO_WIRE).map(([operator, wire]) => [wire, operator])
) as Record<Lang2Operator, QueryOperatorTypes>;

export function isChangeOperator(operator: QueryOperatorTypes | ''): boolean {
  return operator !== '' && CHANGE_OPERATORS.has(operator);
}

export function operatorHasValue(operator: QueryOperatorTypes | Lang2Operator | string | null | undefined): boolean {
  return operator !== QueryOperatorTypes.EXISTS
    && operator !== QueryOperatorTypes.NOT_EXISTS
    && operator !== QueryOperatorTypes.HAS_CHANGED
    && operator !== 'exists'
    && operator !== '!exists'
    && operator !== 'has_changed';
}

export function toWireOperator(operator: QueryOperatorTypes): Lang2Operator {
  return OPERATOR_TO_WIRE[operator];
}

export function operatorMenuLabel(operator: QueryOperatorTypes, phrase: string): string {
  const spelling = OPERATOR_TO_WIRE[operator] ?? operator;
  if (!phrase || phrase === spelling) {
    return spelling;
  }
  return `${phrase} (${spelling})`;
}

export function fromWireOperator(value: unknown): QueryOperatorTypes | '' {
  if (typeof value !== 'string' || value === '') {
    return '';
  }
  if (value in WIRE_TO_OPERATOR) {
    return WIRE_TO_OPERATOR[value as Lang2Operator];
  }
  if (Object.values(QueryOperatorTypes).includes(value as QueryOperatorTypes)) {
    return value as QueryOperatorTypes;
  }
  return '';
}

export function relationNeedsInterval(kind: RelationKind): boolean {
  return kind === 'within' || kind === 'in_the_following';
}

export function valueModeChoices(leaf: QueryLeafNode): ValueMode[] {
  if (isChangeOperator(leaf.operator)) {
    return ['delta'];
  }
  if (leaf.valueAggregation === 'average' || leaf.timeAggregation === 'within') {
    return ['absolute'];
  }
  return ['absolute', 'delta'];
}

export function valueAggregationChoices(leaf: QueryLeafNode): Array<'None' | 'average'> {
  if (isChangeOperator(leaf.operator) || leaf.valueMode === 'delta') {
    return ['None'];
  }
  if (leaf.timeAggregation === 'within') {
    return ['average'];
  }
  if (leaf.timeAggregation === 'within_at_least' || leaf.timeAggregation === 'within_at_most') {
    return ['None'];
  }
  return ['None', 'average'];
}

export function timeAggregationChoices(leaf: QueryLeafNode): TimeAggregation[] {
  if (isChangeOperator(leaf.operator)) {
    return ['None'];
  }
  if (leaf.valueMode === 'delta') {
    return ['None', 'first', 'last'];
  }
  if (leaf.valueAggregation === 'average') {
    return ['None', 'first', 'last', 'within'];
  }
  return ['None', 'first', 'last', 'within', 'within_at_least', 'within_at_most'];
}

export function patchLeaf(leaf: QueryLeafNode, patch: Partial<QueryLeafNode>): QueryLeafNode {
  const next: QueryLeafNode = {...leaf, ...patch, kind: 'leaf'};

  if (patch.operator && isChangeOperator(patch.operator)) {
    next.valueMode = 'delta';
    next.valueAggregation = 'None';
    next.timeAggregation = 'None';
    next.timeWindow = [];
    next.timeWindowCount = null;
  }

  if (patch.operator && !operatorHasValue(patch.operator)) {
    next.value = '';
  }

  if (patch.timeAggregation === 'within') {
    next.valueAggregation = 'average';
    next.valueMode = 'absolute';
    next.deltaWindow = false;
    next.deltaInterval = [];
    next.timeWindowCount = null;
  }

  if (patch.timeAggregation === 'within_at_least' || patch.timeAggregation === 'within_at_most') {
    next.valueAggregation = 'None';
  }

  if (patch.timeAggregation === 'None' || patch.timeAggregation === 'first' || patch.timeAggregation === 'last') {
    next.timeWindow = [];
    next.timeWindowCount = null;
  }

  if (patch.valueAggregation === 'average') {
    next.valueMode = 'absolute';
    next.deltaWindow = false;
    next.deltaInterval = [];
    if (next.timeAggregation === 'within_at_least' || next.timeAggregation === 'within_at_most') {
      next.timeAggregation = 'None';
      next.timeWindow = [];
      next.timeWindowCount = null;
    }
  }

  if (patch.valueMode === 'delta') {
    next.valueAggregation = 'None';
    if (next.timeAggregation === 'within' || next.timeAggregation === 'within_at_least' || next.timeAggregation === 'within_at_most') {
      next.timeAggregation = 'None';
      next.timeWindow = [];
      next.timeWindowCount = null;
    }
  }

  if (patch.valueMode === 'absolute') {
    next.deltaWindow = false;
    next.deltaInterval = [];
  }

  return next;
}

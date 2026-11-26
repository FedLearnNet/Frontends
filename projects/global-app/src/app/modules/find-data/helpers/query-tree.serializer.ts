import {QueryConfig} from '@global-app/find-data/models';
import {DataTypes} from '@global-app/schema/dto/datatype';
import {QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {
  IntervalPartDTO,
  IntervalUnitDTO,
  isQueryGroup,
  QueryGroupDTO,
  QueryLeafDTO,
  QueryNodeDTO,
  TemporalRelationDTO,
  TemporalRelationship,
  TimeAggregationMethod,
  TimeFilterDTO,
} from '@global-app/find-data/dto/query-item';
import {
  createEmptyGroup,
  createEmptyLeaf,
  createQueryNodeId,
  IntervalPart,
  IntervalUnit,
  QueryGroupNode,
  QueryLeafNode,
  QueryNode,
  RelationKind,
  TemporalRelationDraft,
  TimeAggregation,
} from '@global-app/find-data/models/query-tree';
import {operatorHasValue, operatorSpelling, relationNeedsInterval} from '@global-app/find-data/helpers/query-tree.rules';

const UNIT_LABEL: Record<IntervalUnit, { one: string; many: string }> = {
  minutes: {one: 'minute', many: 'minutes'},
  hours: {one: 'hour', many: 'hours'},
  days: {one: 'day', many: 'days'},
  weeks: {one: 'week', many: 'weeks'},
  months: {one: 'month', many: 'months'},
  years: {one: 'year', many: 'years'},
};

const UNIT_TO_WIRE: Record<IntervalUnit, IntervalUnitDTO> = {
  minutes: 'MINUTES',
  hours: 'HOURS',
  days: 'DAYS',
  weeks: 'WEEKS',
  months: 'MONTHS',
  years: 'YEARS',
};

const TIME_AGGREGATION_TO_WIRE: Record<TimeAggregation, TimeAggregationMethod> = {
  None: 'NONE',
  first: 'FIRST',
  last: 'LAST',
  within: 'WITHIN',
  within_at_least: 'WITHIN_AT_LEAST',
  within_at_most: 'WITHIN_AT_MOST',
};

const RELATION_TO_WIRE: Record<RelationKind, TemporalRelationship> = {
  within: 'WITHIN',
  in_the_following: 'IN_THE_FOLLOWING',
  same_time: 'SAME_TIME',
  anytime_after: 'ANYTIME_AFTER',
  same_visit: 'SAME_VISIT',
  same_group: 'SAME_GROUP',
};

const UNIT_FROM_WIRE = invert(UNIT_TO_WIRE);
const TIME_AGGREGATION_FROM_WIRE = invert(TIME_AGGREGATION_TO_WIRE);
const RELATION_FROM_WIRE = invert(RELATION_TO_WIRE);

const OPERATORS = new Set<string>(Object.values(QueryOperatorTypes));
const COMPARISON_OPERATORS = new Set<QueryOperatorTypes>([
  QueryOperatorTypes.EQUAL,
  QueryOperatorTypes.NOT_EQUAL,
  QueryOperatorTypes.BIGGER,
  QueryOperatorTypes.SMALLER,
  QueryOperatorTypes.BIGGER_EQUAL,
  QueryOperatorTypes.SMALLER_EQUAL,
]);
const NUMERIC_PATTERN = /^-?\d+(\.\d+)?$/;

export function serializeQueryTree(group: QueryGroupNode): QueryGroupDTO {
  const wire: QueryGroupDTO = {
    connectingOperator: group.connectingOperator,
    conditions: group.children.map(serializeNode),
  };
  const relations = group.relations
    .filter(relation => relation.source !== null && relation.target !== null)
    .map(serializeRelation);

  if (relations.length) {
    wire.temporalRelations = relations;
  }

  return wire;
}

export function hydrateQueryTree(query: unknown, configs: QueryConfig[] = []): QueryGroupNode {
  if (!isQueryGroup(query)) {
    return createEmptyGroup();
  }

  return parseGroup(query, configs);
}

export function formatQueryGroup(
  group: QueryGroupDTO,
  labelFor: (leaf: QueryLeafDTO) => string = leaf => leaf.ontologyId,
): string {
  const joiner = group.connectingOperator === 'OR' ? ' OR ' : ' AND ';
  return group.conditions.map(condition => {
    if (isQueryGroup(condition)) {
      return `(${formatQueryGroup(condition, labelFor)})`;
    }

    const value = condition.value === undefined || condition.value === '' ? '' : ` ${condition.value}`;
    return `${labelFor(condition)} ${operatorSpelling(condition.operator)}${value}`;
  }).join(joiner);
}

const RELATION_TEXT: Record<RelationKind, string> = {
  within: 'within',
  in_the_following: 'in the following',
  same_time: 'same time',
  anytime_after: 'anytime after',
  same_visit: 'same visit',
  same_group: 'same group',
};

export function describeQueryGroup(
  group: QueryGroupNode,
  labelFor: (leaf: QueryLeafNode) => string = leaf => leaf.catalogName || leaf.ontologyId || '…',
): string {
  const joiner = group.connectingOperator === 'OR' ? ' OR ' : ' AND ';
  const body = group.children
    .map(child => child.kind === 'group' ? `(${describeQueryGroup(child, labelFor)})` : describeLeaf(child, labelFor))
    .join(joiner) || '…';
  const relations = group.relations.map(describeRelation);
  return relations.length ? `${body}. ${relations.join('; ')}` : body;
}

export function describeQueryLeaf(
  leaf: QueryLeafNode,
  labelFor: (leaf: QueryLeafNode) => string = leaf => leaf.catalogName || leaf.ontologyId || '…',
): string {
  return describeLeaf(leaf, labelFor);
}

function describeLeaf(leaf: QueryLeafNode, labelFor: (leaf: QueryLeafNode) => string): string {
  const name = labelFor(leaf);
  if (!leaf.operator) {
    return name || '…';
  }
  const operator = operatorSpelling(leaf.operator);
  const value = operatorHasValue(leaf.operator) && leaf.value !== '' ? ` ${leaf.value}` : '';
  const details = leafDetails(leaf);
  const sentence = `${name} ${operator}${value}`.trim();
  return details.length ? `${sentence} (${details.join(', ')})` : sentence;
}

function leafDetails(leaf: QueryLeafNode): string[] {
  const details: string[] = [];
  if (leaf.valueMode === 'delta') {
    const interval = formatInterval(leaf.deltaInterval);
    details.push(interval ? `delta ${interval}` : 'delta');
  }
  if (leaf.timeFilterChoice === 'between' || (leaf.timeAfter && leaf.timeBefore)) {
    details.push(leaf.timeAfter && leaf.timeBefore ? `between ${leaf.timeAfter} and ${leaf.timeBefore}` : 'between');
  } else if (leaf.timeFilterChoice === 'after' || leaf.timeAfter) {
    details.push(leaf.timeAfter ? `after ${leaf.timeAfter}` : 'after');
  } else if (leaf.timeFilterChoice === 'before' || leaf.timeBefore) {
    details.push(leaf.timeBefore ? `before ${leaf.timeBefore}` : 'before');
  }
  if (leaf.timeAggregation !== 'None') {
    details.push(describeTimeAggregation(leaf));
  }
  if (leaf.valueAggregation === 'average') {
    details.push('average');
  }
  if (leaf.atLeast !== null) {
    details.push(`at least ${leaf.atLeast}`);
  }
  if (leaf.atMost !== null) {
    details.push(`at most ${leaf.atMost}`);
  }
  return details;
}

function describeTimeAggregation(leaf: QueryLeafNode): string {
  if (leaf.timeAggregation === 'first') {
    return 'first';
  }
  if (leaf.timeAggregation === 'last') {
    return 'last';
  }
  const interval = formatInterval(leaf.timeWindow);
  const span = interval ? `within ${interval}` : 'within';
  if (leaf.timeAggregation === 'within_at_least') {
    return `${span} at least ${leaf.timeWindowCount ?? '?'} times`;
  }
  if (leaf.timeAggregation === 'within_at_most') {
    return `${span} at most ${leaf.timeWindowCount ?? '?'} times`;
  }
  return span;
}

function describeRelation(relation: TemporalRelationDraft): string {
  const source = relation.source === null ? '?' : `${relation.source + 1}`;
  const target = relation.target === null ? '?' : `${relation.target + 1}`;
  const interval = relationNeedsInterval(relation.kind) ? formatInterval(relation.interval) : '';
  const phrase = interval ? `${RELATION_TEXT[relation.kind]} ${interval}` : RELATION_TEXT[relation.kind];
  const bounds = [
    relation.atLeast !== null ? `at least ${relation.atLeast}` : '',
    relation.atMost !== null ? `at most ${relation.atMost}` : '',
  ].filter(Boolean);
  return `${source} ${phrase} ${target}${bounds.length ? ` (${bounds.join(', ')})` : ''}`;
}

export function collectOntologyIds(group: QueryGroupDTO): string[] {
  return [...new Set(collectLeaves(group).map(leaf => leaf.ontologyId).filter(Boolean))];
}

export function collectLeaves(group: QueryGroupDTO): QueryLeafDTO[] {
  const leaves: QueryLeafDTO[] = [];
  walk(group, node => {
    if (!isQueryGroup(node)) {
      leaves.push(node);
    }
  });
  return leaves;
}

export function formatInterval(parts: IntervalPart[]): string {
  return parts
    .filter(part => part.count !== null && part.count > 0 && UNIT_LABEL[part.unit])
    .map(part => {
      const count = part.count as number;
      const label = count === 1 ? UNIT_LABEL[part.unit].one : UNIT_LABEL[part.unit].many;
      return `${count} ${label}`;
    })
    .join(' ');
}

function serializeNode(node: QueryNode): QueryNodeDTO {
  return node.kind === 'group' ? serializeQueryTree(node) : serializeLeaf(node);
}

function serializeLeaf(leaf: QueryLeafNode): QueryLeafDTO {
  const operator = leaf.operator || QueryOperatorTypes.EQUAL;
  const wire: QueryLeafDTO = {
    ontologyId: leaf.ontologyId,
    dataTypeId: leaf.dataTypeId,
    operator,
  };
  const value = serializeValue(leaf, operator);
  if (value !== undefined) {
    wire.value = value;
  }
  if (leaf.valueMode === 'delta') {
    wire.valueMode = 'DELTA';
    const deltaInterval = serializeInterval(leaf.deltaInterval);
    if (deltaInterval.length) {
      wire.deltaInterval = deltaInterval;
    }
  }
  const timeFilter = serializeTimeFilter(leaf);
  if (timeFilter) {
    wire.timeFilter = timeFilter;
  }
  if (leaf.timeAggregation !== 'None') {
    wire.timeAggregationMethod = TIME_AGGREGATION_TO_WIRE[leaf.timeAggregation];
  }
  if (isWindowAggregation(leaf.timeAggregation)) {
    const timeWindow = serializeInterval(leaf.timeWindow);
    if (timeWindow.length) {
      wire.timeWindow = timeWindow;
    }
  }
  if (isCountAggregation(leaf.timeAggregation) && leaf.timeWindowCount !== null) {
    wire.timeWindowCount = leaf.timeWindowCount;
  }
  if (leaf.valueAggregation === 'average') {
    wire.valueAggregationMethod = 'AVERAGE';
  }
  if (leaf.atLeast !== null) {
    wire.atLeast = leaf.atLeast;
  }
  if (leaf.atMost !== null) {
    wire.atMost = leaf.atMost;
  }
  return wire;
}

function serializeValue(leaf: QueryLeafNode, operator: QueryOperatorTypes): string | number | undefined {
  if (!operatorHasValue(operator)) {
    return undefined;
  }

  const raw = leaf.value.trim();
  if (raw === '') {
    return undefined;
  }
  if (operator === QueryOperatorTypes.IN || operator === QueryOperatorTypes.NOT_IN) {
    return raw;
  }
  const numericCatalog = leaf.catalogType === DataTypes.INT || leaf.catalogType === DataTypes.FLOAT;
  if ((numericCatalog || COMPARISON_OPERATORS.has(operator)) && NUMERIC_PATTERN.test(raw)) {
    return Number(raw);
  }
  return raw;
}

// parts without a positive count are dropped
function serializeInterval(parts: IntervalPart[]): IntervalPartDTO[] {
  return parts
    .filter(part => part.count !== null && part.count > 0)
    .map(part => ({count: part.count as number, unit: UNIT_TO_WIRE[part.unit]}));
}

function serializeTimeFilter(leaf: QueryLeafNode): TimeFilterDTO | undefined {
  const after = leaf.timeAfter.trim();
  const before = leaf.timeBefore.trim();
  if (!after && !before) {
    return undefined;
  }

  const filter: TimeFilterDTO = {};
  if (after) {
    filter.after = after;
  }
  if (before) {
    filter.before = before;
  }
  return filter;
}

function serializeRelation(relation: TemporalRelationDraft): TemporalRelationDTO {
  const wire: TemporalRelationDTO = {
    sourceCondition: relation.source as number,
    targetCondition: relation.target as number,
    relationship: RELATION_TO_WIRE[relation.kind],
  };
  if (relationNeedsInterval(relation.kind)) {
    const interval = serializeInterval(relation.interval);
    if (interval.length) {
      wire.interval = interval;
    }
  }
  if (relation.atLeast !== null) {
    wire.atLeast = relation.atLeast;
  }
  if (relation.atMost !== null) {
    wire.atMost = relation.atMost;
  }
  return wire;
}

function parseGroup(group: QueryGroupDTO, configs: QueryConfig[]): QueryGroupNode {
  return {
    kind: 'group',
    id: createQueryNodeId(),
    connectingOperator: group.connectingOperator,
    children: group.conditions.map(condition => parseNode(condition, configs)),
    relations: (group.temporalRelations ?? []).map(parseRelation),
    collapsed: false,
  };
}

function parseNode(node: QueryNodeDTO, configs: QueryConfig[]): QueryNode {
  return isQueryGroup(node) ? parseGroup(node, configs) : parseLeaf(node, configs);
}

function parseLeaf(leaf: QueryLeafDTO, configs: QueryConfig[]): QueryLeafNode {
  const config = configs.find(item =>
    item.ontology.id === leaf.ontologyId && item.dataType.id === leaf.dataTypeId
  );
  const timeAggregation = TIME_AGGREGATION_FROM_WIRE[leaf.timeAggregationMethod ?? 'NONE'] ?? 'None';
  const deltaInterval = leaf.valueMode === 'DELTA' ? parseInterval(leaf.deltaInterval) : [];
  const after = leaf.timeFilter?.after ?? '';
  const before = leaf.timeFilter?.before ?? '';
  const draft = createEmptyLeaf();

  return {
    ...draft,
    catalogName: config?.name ?? '',
    ontologyId: leaf.ontologyId ?? '',
    dataTypeId: leaf.dataTypeId ?? '',
    catalogType: config?.dataType.type ?? '',
    operator: parseOperator(leaf.operator),
    value: leaf.value === undefined || leaf.value === null ? '' : `${leaf.value}`,
    valueMode: leaf.valueMode === 'DELTA' ? 'delta' : 'absolute',
    deltaWindow: deltaInterval.length > 0,
    deltaInterval,
    timeFilterChoice: after && before ? 'between' : after ? 'after' : before ? 'before' : 'anytime',
    timeAfter: after,
    timeBefore: before,
    timeAggregation,
    timeWindow: isWindowAggregation(timeAggregation) ? parseInterval(leaf.timeWindow) : [],
    timeWindowCount: isCountAggregation(timeAggregation) ? optionalCount(leaf.timeWindowCount) : null,
    valueAggregation: leaf.valueAggregationMethod === 'AVERAGE' ? 'average' : 'None',
    atLeast: optionalCount(leaf.atLeast),
    atMost: optionalCount(leaf.atMost),
  };
}

function parseRelation(relation: TemporalRelationDTO): TemporalRelationDraft {
  const kind = RELATION_FROM_WIRE[relation.relationship] ?? 'same_group';
  return {
    id: createQueryNodeId(),
    source: relation.sourceCondition,
    target: relation.targetCondition,
    kind,
    interval: relationNeedsInterval(kind) ? parseInterval(relation.interval) : [],
    atLeast: optionalCount(relation.atLeast),
    atMost: optionalCount(relation.atMost),
  };
}

function parseInterval(parts: IntervalPartDTO[] | undefined): IntervalPart[] {
  return (parts ?? []).flatMap(part => {
    const unit = UNIT_FROM_WIRE[part?.unit];
    return unit ? [{count: optionalCount(part.count), unit}] : [];
  });
}

function parseOperator(value: unknown): QueryOperatorTypes | '' {
  return typeof value === 'string' && OPERATORS.has(value) ? value as QueryOperatorTypes : '';
}

function optionalCount(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function isWindowAggregation(method: TimeAggregation): boolean {
  return method === 'within' || isCountAggregation(method);
}

function isCountAggregation(method: TimeAggregation): boolean {
  return method === 'within_at_least' || method === 'within_at_most';
}

function invert<K extends string, V extends string>(record: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [value, key])) as Record<V, K>;
}

function walk(node: QueryNodeDTO, visit: (node: QueryNodeDTO) => void): void {
  visit(node);
  if (isQueryGroup(node)) {
    node.conditions.forEach(condition => walk(condition, visit));
  }
}

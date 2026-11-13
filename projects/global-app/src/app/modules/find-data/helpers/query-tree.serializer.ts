import {QueryConfig} from '@global-app/find-data/models';
import {DataTypes} from '@global-app/schema/dto/datatype';
import {
  DatatypeHint,
  isLang2Group,
  Lang2Group,
  Lang2Leaf,
  Lang2Node,
  Lang2Operator,
  Lang2TemporalRelation,
  Lang2TimeFilter,
} from '@global-app/find-data/dto/lang2-query';
import {
  createEmptyGroup,
  createEmptyLeaf,
  createQueryNodeId,
  DatatypeHintValue,
  IntervalPart,
  IntervalUnit,
  QueryGroupNode,
  QueryLeafNode,
  QueryNode,
  RelationKind,
  TemporalRelationDraft,
  TimeAggregation,
} from '@global-app/find-data/models/query-tree';
import {fromWireOperator, operatorHasValue, relationNeedsInterval, toWireOperator} from '@global-app/find-data/helpers/query-tree.rules';

const INTERVAL_UNITS: Record<string, IntervalUnit> = {
  minute: 'minutes',
  minutes: 'minutes',
  hour: 'hours',
  hours: 'hours',
  day: 'days',
  days: 'days',
  week: 'weeks',
  weeks: 'weeks',
  month: 'months',
  months: 'months',
  year: 'years',
  years: 'years',
};

const UNIT_LABEL: Record<IntervalUnit, { one: string; many: string }> = {
  minutes: {one: 'minute', many: 'minutes'},
  hours: {one: 'hour', many: 'hours'},
  days: {one: 'day', many: 'days'},
  weeks: {one: 'week', many: 'weeks'},
  months: {one: 'month', many: 'months'},
  years: {one: 'year', many: 'years'},
};

const COMPARISON_OPERATORS = new Set<Lang2Operator>(['=', '!=', '>', '<', '>=', '<=']);
const NUMERIC_PATTERN = /^-?\d+(\.\d+)?$/;
const INTEGER_PATTERN = /^-?\d+$/;

export function serializeQueryTree(group: QueryGroupNode): Lang2Group {
  const wire: Lang2Group = {
    connecting_operator: group.connectingOperator,
    conditions: group.children.map(serializeNode),
  };
  const relations = group.relations
    .filter(relation => relation.source !== null && relation.target !== null)
    .map(serializeRelation);

  if (relations.length) {
    wire.temporal_relations = relations;
  }

  return wire;
}

export function hydrateQueryTree(query: unknown, configs: QueryConfig[] = []): QueryGroupNode {
  if (!isLang2Group(query)) {
    return createEmptyGroup();
  }

  return parseGroup(query, configs);
}

export function formatLang2Query(
  group: Lang2Group,
  labelFor: (leaf: Lang2Leaf) => string = leaf => leaf.ontology_id,
): string {
  const joiner = group.connecting_operator === '$or' ? ' OR ' : ' AND ';
  return group.conditions.map(condition => {
    if (isLang2Group(condition)) {
      return `(${formatLang2Query(condition, labelFor)})`;
    }

    const value = condition.value === undefined || condition.value === '' ? '' : ` ${condition.value}`;
    return `${labelFor(condition)} ${condition.operator}${value}`;
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
  const joiner = group.connectingOperator === '$or' ? ' OR ' : ' AND ';
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
  const operator = toWireOperator(leaf.operator);
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

export function collectOntologyIds(group: Lang2Group): string[] {
  return [...new Set(collectLeaves(group).map(leaf => leaf.ontology_id).filter(Boolean))];
}

export function collectLeaves(group: Lang2Group): Lang2Leaf[] {
  const leaves: Lang2Leaf[] = [];
  walk(group, node => {
    if (!isLang2Group(node)) {
      leaves.push(node);
    }
  });
  return leaves;
}

export function formatInterval(parts: IntervalPart[]): string {
  return parts
    .filter(part => part.count !== null && part.count > 0 && INTERVAL_UNITS[part.unit])
    .map(part => {
      const count = part.count as number;
      const label = count === 1 ? UNIT_LABEL[part.unit].one : UNIT_LABEL[part.unit].many;
      return `${count} ${label}`;
    })
    .join(' ');
}

export function parseInterval(text: string): IntervalPart[] {
  return [...text.matchAll(/(\d+)\s+(minute|hour|day|week|month|year)s?/gi)].flatMap(match => {
    const unit = INTERVAL_UNITS[match[2].toLowerCase()];
    if (!unit) {
      return [];
    }
    return [{count: Number(match[1]), unit}];
  });
}

function serializeNode(node: QueryNode): Lang2Node {
  return node.kind === 'group' ? serializeQueryTree(node) : serializeLeaf(node);
}

function serializeLeaf(leaf: QueryLeafNode): Lang2Leaf {
  const operator = leaf.operator ? toWireOperator(leaf.operator) : '=';
  const wire: Lang2Leaf = {
    ontology_id: leaf.ontologyId,
    data_type_id: leaf.dataTypeId,
    operator,
    value_mode: serializeValueMode(leaf),
    time_aggregation_method: serializeTimeAggregation(leaf),
    value_aggregation_method: leaf.valueAggregation,
  };
  const value = serializeValue(leaf, operator);
  if (value !== undefined) {
    wire.value = value;
  }
  if (leaf.datatypeHint) {
    wire.datatype = leaf.datatypeHint;
  }
  const timeFilter = serializeTimeFilter(leaf);
  if (timeFilter) {
    wire.time_filter = timeFilter;
  }
  if (leaf.atLeast !== null) {
    wire.at_least = leaf.atLeast;
  }
  if (leaf.atMost !== null) {
    wire.at_most = leaf.atMost;
  }
  return wire;
}

function serializeValue(leaf: QueryLeafNode, operator: Lang2Operator): string | number | undefined {
  if (!operatorHasWireValue(operator)) {
    return undefined;
  }

  const raw = leaf.value.trim();
  if (raw === '') {
    return undefined;
  }
  if (operator === 'in' || operator === '!in') {
    return raw;
  }
  if (leaf.datatypeHint === 'String' || leaf.datatypeHint === 'Boolean') {
    return raw;
  }
  if (leaf.datatypeHint === 'Integer' && INTEGER_PATTERN.test(raw)) {
    return Number(raw);
  }
  if (leaf.datatypeHint === 'Float' && NUMERIC_PATTERN.test(raw)) {
    return Number(raw);
  }
  const numericCatalog = leaf.catalogType === DataTypes.INT || leaf.catalogType === DataTypes.FLOAT;
  if ((numericCatalog || COMPARISON_OPERATORS.has(operator)) && NUMERIC_PATTERN.test(raw) && leaf.datatypeHint === '') {
    return Number(raw);
  }
  return raw;
}

function serializeValueMode(leaf: QueryLeafNode): string {
  if (leaf.valueMode === 'absolute') {
    return 'absolute';
  }
  const interval = formatInterval(leaf.deltaInterval);
  return interval ? `delta ${interval}` : 'delta';
}

function serializeTimeAggregation(leaf: QueryLeafNode): string {
  if (leaf.timeAggregation === 'None' || leaf.timeAggregation === 'first' || leaf.timeAggregation === 'last') {
    return leaf.timeAggregation;
  }

  const interval = formatInterval(leaf.timeWindow);
  if (leaf.timeAggregation === 'within') {
    return interval ? `within ${interval}` : 'within';
  }

  const count = leaf.timeWindowCount ?? '';
  const bound = leaf.timeAggregation === 'within_at_least' ? 'at least' : 'at most';
  return interval ? `within ${interval} ${bound} ${count} times` : `within ${bound} ${count} times`;
}

function serializeTimeFilter(leaf: QueryLeafNode): Lang2TimeFilter | undefined {
  const after = leaf.timeAfter.trim();
  const before = leaf.timeBefore.trim();
  if (!after && !before) {
    return undefined;
  }

  const filter: Lang2TimeFilter = {};
  if (after) {
    filter.after = after;
  }
  if (before) {
    filter.before = before;
  }
  return filter;
}

function serializeRelation(relation: TemporalRelationDraft): Lang2TemporalRelation {
  const wire: Lang2TemporalRelation = {
    source_condition: relation.source as number,
    target_condition: relation.target as number,
    relationship: serializeRelationship(relation),
  };
  if (relation.atLeast !== null) {
    wire.at_least = relation.atLeast;
  }
  if (relation.atMost !== null) {
    wire.at_most = relation.atMost;
  }
  return wire;
}

function serializeRelationship(relation: TemporalRelationDraft): string {
  const interval = formatInterval(relation.interval);
  switch (relation.kind) {
    case 'within':
      return interval ? `within ${interval}` : 'within';
    case 'in_the_following':
      return interval ? `in the following ${interval}` : 'in the following';
    case 'same_time':
      return 'same time';
    case 'anytime_after':
      return 'anytime after';
    case 'same_visit':
      return 'same visit';
    case 'same_group':
      return 'same group';
  }
}

function parseGroup(group: Lang2Group, configs: QueryConfig[]): QueryGroupNode {
  return {
    kind: 'group',
    id: createQueryNodeId(),
    connectingOperator: group.connecting_operator,
    children: group.conditions.map(condition => parseNode(condition, configs)),
    relations: (group.temporal_relations ?? []).map(parseRelation),
    collapsed: false,
  };
}

function parseNode(node: Lang2Node, configs: QueryConfig[]): QueryNode {
  return isLang2Group(node) ? parseGroup(node, configs) : parseLeaf(node, configs);
}

function parseLeaf(leaf: Lang2Leaf, configs: QueryConfig[]): QueryLeafNode {
  const config = configs.find(item =>
    item.ontology.id === leaf.ontology_id && item.dataType.id === leaf.data_type_id
  );
  const valueMode = parseValueMode(leaf.value_mode);
  const timeAggregation = parseTimeAggregation(leaf.time_aggregation_method);
  const timeFilter = parseTimeFilter(leaf.time_filter);
  const draft = createEmptyLeaf();

  return {
    ...draft,
    catalogName: config?.name ?? '',
    ontologyId: leaf.ontology_id ?? '',
    dataTypeId: leaf.data_type_id ?? '',
    catalogType: config?.dataType.type ?? '',
    operator: fromWireOperator(leaf.operator),
    value: leaf.value === undefined || leaf.value === null ? '' : `${leaf.value}`,
    datatypeHint: parseDatatypeHint(leaf.datatype),
    valueMode: valueMode.mode,
    deltaWindow: valueMode.interval.length > 0,
    deltaInterval: valueMode.interval,
    timeFilterChoice: timeFilter.after && timeFilter.before
      ? 'between'
      : timeFilter.after
        ? 'after'
        : timeFilter.before
          ? 'before'
          : 'anytime',
    timeAfter: timeFilter.after,
    timeBefore: timeFilter.before,
    timeAggregation: timeAggregation.method,
    timeWindow: timeAggregation.window,
    timeWindowCount: timeAggregation.count,
    valueAggregation: leaf.value_aggregation_method === 'average' ? 'average' : 'None',
    atLeast: optionalCount(leaf.at_least),
    atMost: optionalCount(leaf.at_most),
  };
}

function parseRelation(relation: Lang2TemporalRelation): TemporalRelationDraft {
  const parsed = parseRelationship(relation.relationship);
  return {
    id: createQueryNodeId(),
    source: relation.source_condition,
    target: relation.target_condition,
    kind: parsed.kind,
    interval: parsed.interval,
    atLeast: optionalCount(relation.at_least),
    atMost: optionalCount(relation.at_most),
  };
}

function parseValueMode(value: string | undefined): { mode: 'absolute' | 'delta'; interval: IntervalPart[] } {
  if (!value || value === 'absolute') {
    return {mode: 'absolute', interval: []};
  }
  if (value === 'delta') {
    return {mode: 'delta', interval: []};
  }
  if (value.startsWith('delta ')) {
    return {mode: 'delta', interval: parseInterval(value.slice('delta '.length))};
  }
  return {mode: 'absolute', interval: []};
}

function parseTimeAggregation(value: string | undefined): { method: TimeAggregation; window: IntervalPart[]; count: number | null } {
  if (!value || value === 'None') {
    return {method: 'None', window: [], count: null};
  }
  if (value === 'first' || value === 'last') {
    return {method: value, window: [], count: null};
  }

  const bounded = value.match(/^within (.+) at (least|most) (\d+) times$/);
  if (bounded) {
    return {
      method: bounded[2] === 'least' ? 'within_at_least' : 'within_at_most',
      window: parseInterval(bounded[1]),
      count: Number(bounded[3]),
    };
  }

  const within = value.match(/^within (.+)$/);
  if (within) {
    return {method: 'within', window: parseInterval(within[1]), count: null};
  }

  return {method: 'None', window: [], count: null};
}

function parseTimeFilter(value: Lang2Leaf['time_filter']): { after: string; before: string } {
  if (!value || value === 'anytime' || typeof value === 'string') {
    return {after: '', before: ''};
  }
  return {
    after: value.after ?? '',
    before: value.before ?? '',
  };
}

function parseRelationship(value: string): { kind: RelationKind; interval: IntervalPart[] } {
  if (value === 'same time') {
    return {kind: 'same_time', interval: []};
  }
  if (value === 'anytime after') {
    return {kind: 'anytime_after', interval: []};
  }
  if (value === 'same visit') {
    return {kind: 'same_visit', interval: []};
  }
  if (value === 'same group') {
    return {kind: 'same_group', interval: []};
  }
  if (value.startsWith('in the following ')) {
    return {kind: 'in_the_following', interval: parseInterval(value.slice('in the following '.length))};
  }
  if (value.startsWith('within ')) {
    return {kind: 'within', interval: parseInterval(value.slice('within '.length))};
  }
  return {kind: 'same_group', interval: []};
}

function parseDatatypeHint(value: unknown): DatatypeHintValue {
  if (value === 'String' || value === 'Integer' || value === 'Float' || value === 'Boolean') {
    return value as DatatypeHint;
  }
  return '';
}

function optionalCount(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function operatorHasWireValue(operator: Lang2Operator): boolean {
  return operator !== 'exists' && operator !== '!exists' && operator !== 'has_changed';
}

function walk(node: Lang2Node, visit: (node: Lang2Node) => void): void {
  visit(node);
  if (isLang2Group(node)) {
    node.conditions.forEach(condition => walk(condition, visit));
  }
}

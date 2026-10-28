import {QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {isLang2Group} from '@global-app/find-data/dto/lang2-query';
import {
  IntervalPart,
  QueryGroupNode,
  QueryLeafNode,
  QueryNode,
} from '@global-app/find-data/models/query-tree';
import {isChangeOperator, operatorHasValue, relationNeedsInterval} from '@global-app/find-data/helpers/query-tree.rules';
import {DataTypes} from '@global-app/schema/dto/datatype';

const TEXT_OPERATORS = new Set<QueryOperatorTypes>([
  QueryOperatorTypes.CONTAINS,
  QueryOperatorTypes.START_WIDTH,
  QueryOperatorTypes.END_WIDTH,
  QueryOperatorTypes.REGEX,
]);

const NON_TEXT_CATALOG_TYPES = new Set<DataTypes>([
  DataTypes.INT,
  DataTypes.FLOAT,
  DataTypes.DATE,
  DataTypes.BOOLEAN,
]);

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface QueryTreeIssue {
  path: string;
  code: string;
}

export function isQueryTreeValid(group: QueryGroupNode): boolean {
  return validateQueryTree(group).length === 0;
}

export function validateQueryTree(group: QueryGroupNode): QueryTreeIssue[] {
  return validateGroup(group, 'query');
}

function validateGroup(group: QueryGroupNode, path: string): QueryTreeIssue[] {
  const issues: QueryTreeIssue[] = [];
  if (group.children.length === 0) {
    issues.push({path, code: 'empty-group'});
  }

  group.children.forEach((child, index) => {
    issues.push(...validateNode(child, `${path}.conditions[${index}]`));
  });

  group.relations.forEach((relation, index) => {
    const relationPath = `${path}.temporal_relations[${index}]`;
    if (relation.source === null || relation.target === null) {
      issues.push({path: relationPath, code: 'relation-endpoint'});
      return;
    }
    if (relation.source === relation.target) {
      issues.push({path: relationPath, code: 'relation-same-endpoint'});
    }
    issues.push(...validateEndpoint(group, relation.source, relationPath));
    issues.push(...validateEndpoint(group, relation.target, relationPath));
    if (relationNeedsInterval(relation.kind)) {
      issues.push(...validateInterval(relation.interval, relationPath, true));
    }
    issues.push(...validateBounds(relation.atLeast, relation.atMost, relationPath));
  });

  return issues;
}

function validateNode(node: QueryNode, path: string): QueryTreeIssue[] {
  return node.kind === 'group' ? validateGroup(node, path) : validateLeaf(node, path);
}

function validateLeaf(leaf: QueryLeafNode, path: string): QueryTreeIssue[] {
  const issues: QueryTreeIssue[] = [];
  if (!leaf.ontologyId || !leaf.dataTypeId) {
    issues.push({path, code: 'missing-catalog'});
  }
  if (!leaf.operator) {
    issues.push({path, code: 'missing-operator'});
  }
  if (leaf.operator && operatorHasValue(leaf.operator) && leaf.value.trim() === '') {
    issues.push({path, code: 'missing-value'});
  }
  if (leaf.operator === QueryOperatorTypes.NOT_CONTAINS) {
    issues.push({path, code: 'unsupported-operator'});
  }
  if (leaf.operator && TEXT_OPERATORS.has(leaf.operator) && leaf.catalogType !== '' && NON_TEXT_CATALOG_TYPES.has(leaf.catalogType)) {
    issues.push({path, code: 'text-operator-type'});
  }
  if (leaf.datatypeHint === 'Integer' && leaf.value.trim() !== '' && !/^-?\d+$/.test(leaf.value.trim())) {
    issues.push({path, code: 'integer-value'});
  }

  if (isChangeOperator(leaf.operator)) {
    if (leaf.valueMode !== 'delta') {
      issues.push({path, code: 'change-requires-delta'});
    }
    if (leaf.timeAggregation !== 'None' || leaf.valueAggregation !== 'None') {
      issues.push({path, code: 'change-aggregation'});
    }
  }

  if (leaf.valueAggregation === 'average' && leaf.valueMode !== 'absolute') {
    issues.push({path, code: 'average-requires-absolute'});
  }
  if (leaf.valueMode === 'delta' && leaf.valueAggregation === 'average') {
    issues.push({path, code: 'delta-average'});
  }
  if (leaf.timeAggregation === 'within') {
    if (leaf.valueAggregation !== 'average') {
      issues.push({path, code: 'within-requires-average'});
    }
    issues.push(...validateInterval(leaf.timeWindow, path, true));
  }
  if (leaf.timeAggregation === 'within_at_least' || leaf.timeAggregation === 'within_at_most') {
    if (leaf.valueAggregation === 'average') {
      issues.push({path, code: 'within-count-average'});
    }
    issues.push(...validateInterval(leaf.timeWindow, path, true));
    if (!isPositiveInteger(leaf.timeWindowCount)) {
      issues.push({path, code: 'within-count'});
    }
  }
  if (leaf.valueMode === 'delta' && leaf.deltaInterval.length) {
    issues.push(...validateInterval(leaf.deltaInterval, path, false));
  }

  if ((leaf.timeFilterChoice === 'after' || leaf.timeFilterChoice === 'between') && !leaf.timeAfter.trim()) {
    issues.push({path, code: 'date-after'});
  }
  if ((leaf.timeFilterChoice === 'before' || leaf.timeFilterChoice === 'between') && !leaf.timeBefore.trim()) {
    issues.push({path, code: 'date-before'});
  }
  issues.push(...validateDate(leaf.timeAfter, path, 'after'));
  issues.push(...validateDate(leaf.timeBefore, path, 'before'));
  issues.push(...validateBounds(leaf.atLeast, leaf.atMost, path));
  return issues;
}

function validateEndpoint(group: QueryGroupNode, index: number, path: string): QueryTreeIssue[] {
  const child = group.children[index];
  if (!child || child.kind !== 'leaf') {
    return [{path, code: 'relation-not-leaf'}];
  }
  if (child.valueAggregation === 'average') {
    return [{path, code: 'relation-average'}];
  }
  return [];
}

function validateInterval(parts: IntervalPart[], path: string, required: boolean): QueryTreeIssue[] {
  if (required && parts.length === 0) {
    return [{path, code: 'missing-interval'}];
  }

  const issues: QueryTreeIssue[] = [];
  parts.forEach(part => {
    if (!isPositiveInteger(part.count)) {
      issues.push({path, code: 'interval-count'});
    }
  });
  return issues;
}

function validateBounds(atLeast: number | null, atMost: number | null, path: string): QueryTreeIssue[] {
  const issues: QueryTreeIssue[] = [];
  if (atLeast !== null && !isNonNegativeInteger(atLeast)) {
    issues.push({path, code: 'at-least'});
  }
  if (atMost !== null && !isNonNegativeInteger(atMost)) {
    issues.push({path, code: 'at-most'});
  }
  if (atLeast !== null && atMost !== null && atLeast > atMost) {
    issues.push({path, code: 'at-least-above-at-most'});
  }
  return issues;
}

function validateDate(value: string, path: string, code: string): QueryTreeIssue[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  if (!DATE_PATTERN.test(trimmed) || !isRealDate(trimmed)) {
    return [{path, code: `date-${code}`}];
  }
  return [];
}

function isRealDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isPositiveInteger(value: number | null): boolean {
  return value !== null && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function groupCarriesLeafFields(group: Lang2GroupShape): boolean {
  return isLang2Group(group) && (
    'ontology_id' in group
    || 'operator' in group
    || 'value' in group
    || 'value_mode' in group
    || 'time_filter' in group
    || 'time_aggregation_method' in group
    || 'value_aggregation_method' in group
    || 'at_least' in group
    || 'at_most' in group
    || 'datatype' in group
    || 'scale' in group
  );
}

interface Lang2GroupShape {
  connecting_operator?: string;
  conditions?: unknown[];
}

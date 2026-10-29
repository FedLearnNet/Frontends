import {QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {DataTypes} from '@global-app/schema/dto/datatype';

export type IntervalUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

export interface IntervalPart {
  count: number | null;
  unit: IntervalUnit;
}

export type TimeAggregation =
  | 'None'
  | 'first'
  | 'last'
  | 'within'
  | 'within_at_least'
  | 'within_at_most';

export type RelationKind =
  | 'within'
  | 'in_the_following'
  | 'same_time'
  | 'anytime_after'
  | 'same_visit'
  | 'same_group';

export type ValueMode = 'absolute' | 'delta';

export type TimeFilterChoice = 'anytime' | 'after' | 'before' | 'between';

export type DatatypeHintValue = '' | 'String' | 'Integer' | 'Float' | 'Boolean';

export interface QueryLeafNode {
  kind: 'leaf';
  id: string;
  catalogName: string;
  ontologyId: string;
  dataTypeId: string;
  catalogType: DataTypes | '';
  operator: QueryOperatorTypes | '';
  value: string;
  datatypeHint: DatatypeHintValue;
  valueMode: ValueMode;
  deltaWindow: boolean;
  deltaInterval: IntervalPart[];
  timeFilterChoice: TimeFilterChoice;
  timeAfter: string;
  timeBefore: string;
  timeAggregation: TimeAggregation;
  timeWindow: IntervalPart[];
  timeWindowCount: number | null;
  valueAggregation: 'None' | 'average';
  atLeast: number | null;
  atMost: number | null;
}

export interface TemporalRelationDraft {
  id: string;
  source: number | null;
  target: number | null;
  kind: RelationKind;
  interval: IntervalPart[];
  atLeast: number | null;
  atMost: number | null;
}

export interface QueryGroupNode {
  kind: 'group';
  id: string;
  connectingOperator: '$and' | '$or';
  children: QueryNode[];
  relations: TemporalRelationDraft[];
  collapsed: boolean;
}

export type QueryNode = QueryGroupNode | QueryLeafNode;

let sequence = 0;

export function createQueryNodeId(): string {
  sequence += 1;
  return `query-node-${sequence}`;
}

export function createEmptyLeaf(): QueryLeafNode {
  return {
    kind: 'leaf',
    id: createQueryNodeId(),
    catalogName: '',
    ontologyId: '',
    dataTypeId: '',
    catalogType: '',
    operator: '',
    value: '',
    datatypeHint: '',
    valueMode: 'absolute',
    deltaWindow: false,
    deltaInterval: [],
    timeFilterChoice: 'anytime',
    timeAfter: '',
    timeBefore: '',
    timeAggregation: 'None',
    timeWindow: [],
    timeWindowCount: null,
    valueAggregation: 'None',
    atLeast: null,
    atMost: null,
  };
}

export function createEmptyGroup(withLeaf = true): QueryGroupNode {
  return {
    kind: 'group',
    id: createQueryNodeId(),
    connectingOperator: '$and',
    children: withLeaf ? [createEmptyLeaf()] : [],
    relations: [],
    collapsed: false,
  };
}

export function createRelation(group: QueryGroupNode): TemporalRelationDraft {
  const leaves = group.children.flatMap((child, index) =>
    child.kind === 'leaf' && child.valueAggregation !== 'average' ? [index] : []
  );

  return {
    id: createQueryNodeId(),
    source: leaves[0] ?? null,
    target: leaves[1] ?? null,
    kind: 'same_group',
    interval: [],
    atLeast: null,
    atMost: null,
  };
}

export function countLeaves(node: QueryNode): number {
  if (node.kind === 'leaf') {
    return 1;
  }

  return node.children.reduce((total, child) => total + countLeaves(child), 0);
}

export function canAddRelation(group: QueryGroupNode): boolean {
  return group.children.filter(child => child.kind === 'leaf').length >= 2;
}

export function cloneQueryNode<T extends QueryNode>(node: T): T {
  const copy = structuredClone(node);
  reassignIds(copy);
  if (copy.kind === 'group') {
    copy.collapsed = false;
  }
  return copy;
}

export function updateChild(group: QueryGroupNode, index: number, child: QueryNode): QueryGroupNode {
  const children = group.children.slice();
  children[index] = child;
  const relations = child.kind === 'leaf' && child.valueAggregation === 'average'
    ? group.relations.filter(relation => relation.source !== index && relation.target !== index)
    : group.relations;

  return {...group, children, relations};
}

export function insertChild(group: QueryGroupNode, index: number, child: QueryNode): QueryGroupNode {
  const children = group.children.slice();
  children.splice(index, 0, child);
  const relations = group.relations.map(relation => ({
    ...relation,
    source: shiftUp(relation.source, index),
    target: shiftUp(relation.target, index),
  }));

  return {...group, children, relations};
}

export function removeChild(group: QueryGroupNode, index: number): QueryGroupNode {
  const children = group.children.filter((_, childIndex) => childIndex !== index);
  const relations = group.relations.flatMap(relation => {
    const source = shiftDown(relation.source, index);
    const target = shiftDown(relation.target, index);
    if (source === null || target === null) {
      return [];
    }
    return [{...relation, source, target}];
  });

  return {...group, children, relations};
}

export function moveChild(group: QueryGroupNode, index: number, direction: -1 | 1): QueryGroupNode {
  const target = index + direction;
  if (target < 0 || target >= group.children.length) {
    return group;
  }

  const children = group.children.slice();
  const [moved] = children.splice(index, 1);
  children.splice(target, 0, moved);
  const relations = group.relations.map(relation => ({
    ...relation,
    source: swapIndex(relation.source, index, target),
    target: swapIndex(relation.target, index, target),
  }));

  return {...group, children, relations};
}

function reassignIds(node: QueryNode): void {
  node.id = createQueryNodeId();
  if (node.kind === 'group') {
    node.relations.forEach(relation => {
      relation.id = createQueryNodeId();
    });
    node.children.forEach(reassignIds);
  }
}

function shiftUp(value: number | null, insertedAt: number): number | null {
  if (value === null || value < insertedAt) {
    return value;
  }
  return value + 1;
}

function shiftDown(value: number | null, removedAt: number): number | null {
  if (value === null || value === removedAt) {
    return null;
  }
  return value > removedAt ? value - 1 : value;
}

function swapIndex(value: number | null, from: number, to: number): number | null {
  if (value === from) {
    return to;
  }
  if (value === to) {
    return from;
  }
  return value;
}

import {QueryOperatorTypes} from '@global-app/find-data/dto/query';
import {groupCarriesLeafFields, isQueryTreeValid, validateQueryTree} from '@global-app/find-data/helpers/query-tree.validator';
import {describeQueryGroup, hydrateQueryTree, serializeQueryTree} from '@global-app/find-data/helpers/query-tree.serializer';
import {
  createEmptyGroup,
  createEmptyLeaf,
  moveChild,
  QueryGroupNode,
  QueryLeafNode,
  removeChild,
} from '@global-app/find-data/models/query-tree';
import {DataTypes} from '@global-app/schema/dto/datatype';

describe('query tree serializer', () => {
  function leaf(partial: Partial<QueryLeafNode> = {}): QueryLeafNode {
    return {...createEmptyLeaf(), ...partial};
  }

  function group(partial: Partial<QueryGroupNode> = {}): QueryGroupNode {
    return {...createEmptyGroup(false), ...partial};
  }

  const valueLeaf = (partial: Partial<QueryLeafNode> = {}): QueryLeafNode => leaf({
    ontologyId: 'value-ontology-uuid',
    dataTypeId: 'value-datatype-uuid',
    operator: QueryOperatorTypes.BIGGER,
    value: '100',
    catalogType: DataTypes.FLOAT,
    ...partial,
  });

  it('serializes first, last, and unaggregated numeric comparisons', () => {
    const wire = serializeQueryTree(group({
      connectingOperator: 'OR',
      children: [
        valueLeaf({timeAfter: '2023-12-31', timeAggregation: 'first'}),
        valueLeaf({timeBefore: '2025-01-01', timeAggregation: 'last'}),
        valueLeaf({timeBefore: '2024-01-01'}),
      ],
    }));

    expect(wire).toEqual({
      connectingOperator: 'OR',
      conditions: [
        {
          ontologyId: 'value-ontology-uuid',
          dataTypeId: 'value-datatype-uuid',
          operator: QueryOperatorTypes.BIGGER,
          value: 100,
          timeFilter: {after: '2023-12-31'},
          timeAggregationMethod: 'FIRST',
        },
        {
          ontologyId: 'value-ontology-uuid',
          dataTypeId: 'value-datatype-uuid',
          operator: QueryOperatorTypes.BIGGER,
          value: 100,
          timeFilter: {before: '2025-01-01'},
          timeAggregationMethod: 'LAST',
        },
        {
          ontologyId: 'value-ontology-uuid',
          dataTypeId: 'value-datatype-uuid',
          operator: QueryOperatorTypes.BIGGER,
          value: 100,
          timeFilter: {before: '2024-01-01'},
        },
      ],
    });
    expect(JSON.stringify(wire)).not.toContain('scale');
    expect(groupCarriesLeafFields(wire)).toBeFalse();
  });

  it('flags a group that carries leaf fields', () => {
    expect(groupCarriesLeafFields({connectingOperator: 'AND', conditions: [], ontologyId: 'x'})).toBeTrue();
    expect(groupCarriesLeafFields({connectingOperator: 'AND', conditions: [], timeWindow: []})).toBeTrue();
  });

  it('serializes a same-group relation between a code and the first numeric value', () => {
    const wire = serializeQueryTree(group({
      children: [
        leaf({
          ontologyId: 'code-ontology-uuid',
          dataTypeId: 'code-datatype-uuid',
          operator: QueryOperatorTypes.EQUAL,
          value: '9999-9',
        }),
        valueLeaf({timeAggregation: 'first'}),
      ],
      relations: [{
        id: 'relation-1',
        source: 0,
        target: 1,
        kind: 'same_group',
        interval: [{count: 2, unit: 'days'}],
        atLeast: null,
        atMost: null,
      }],
    }));

    expect(wire).toEqual({
      connectingOperator: 'AND',
      temporalRelations: [
        {sourceCondition: 0, targetCondition: 1, relationship: 'SAME_GROUP'},
      ],
      conditions: [
        {
          ontologyId: 'code-ontology-uuid',
          dataTypeId: 'code-datatype-uuid',
          operator: QueryOperatorTypes.EQUAL,
          value: '9999-9',
        },
        {
          ontologyId: 'value-ontology-uuid',
          dataTypeId: 'value-datatype-uuid',
          operator: QueryOperatorTypes.BIGGER,
          value: 100,
          timeAggregationMethod: 'FIRST',
        },
      ],
    });
  });

  it('serializes a text match with at least two occurrences and omits unset fields', () => {
    const wire = serializeQueryTree(group({
      children: [
        leaf({
          ontologyId: 'role-ontology-uuid',
          dataTypeId: 'string-datatype-uuid',
          operator: QueryOperatorTypes.CONTAINS,
          value: 'Employee',
          atLeast: 2,
        }),
      ],
    }));

    expect(wire).toEqual({
      connectingOperator: 'AND',
      conditions: [
        {
          ontologyId: 'role-ontology-uuid',
          dataTypeId: 'string-datatype-uuid',
          operator: QueryOperatorTypes.CONTAINS,
          value: 'Employee',
          atLeast: 2,
        },
      ],
    });
    expect(wire.temporalRelations).toBeUndefined();
  });

  it('sends membership values as one string and omits values for exists and has_changed', () => {
    const wire = serializeQueryTree(group({
      children: [
        leaf({
          ontologyId: 'codes',
          dataTypeId: 'code',
          operator: QueryOperatorTypes.IN,
          value: 'A, B',
        }),
        leaf({
          ontologyId: 'flag',
          dataTypeId: 'flag',
          operator: QueryOperatorTypes.HAS_CHANGED,
          value: 'ignored',
          valueMode: 'delta',
        }),
      ],
    }));

    expect(wire.conditions[0]).toEqual(jasmine.objectContaining({operator: QueryOperatorTypes.IN, value: 'A, B'}));
    expect(wire.conditions[1]).toEqual(jasmine.objectContaining({operator: QueryOperatorTypes.HAS_CHANGED, valueMode: 'DELTA'}));
    expect(wire.conditions[1]).not.toEqual(jasmine.objectContaining({value: jasmine.anything()}));
  });

  it('drops a stored datatype hint', () => {
    const root = hydrateQueryTree({
      connectingOperator: 'AND',
      conditions: [{ontologyId: 'lab', dataTypeId: 'lab-value', datatype: 'FLOAT', operator: 'EQUAL', value: 'abc'}],
    });

    expect(Object.keys(serializeQueryTree(root).conditions[0])).not.toContain('datatype');
  });

  it('sends window fields only with a method that uses them', () => {
    const wire = serializeQueryTree(group({
      children: [
        valueLeaf({timeAggregation: 'first', timeWindow: [{count: 1, unit: 'weeks'}], timeWindowCount: 2}),
        valueLeaf({timeAggregation: 'within', valueAggregation: 'average', timeWindow: [{count: 1, unit: 'weeks'}], timeWindowCount: 2}),
        valueLeaf({valueMode: 'absolute', deltaInterval: [{count: 1, unit: 'days'}]}),
      ],
    }));

    expect(Object.keys(wire.conditions[0])).not.toContain('timeWindow');
    expect(Object.keys(wire.conditions[0])).not.toContain('timeWindowCount');
    expect(wire.conditions[1]).toEqual(jasmine.objectContaining({timeWindow: [{count: 1, unit: 'WEEKS'}]}));
    expect(Object.keys(wire.conditions[1])).not.toContain('timeWindowCount');
    expect(Object.keys(wire.conditions[2])).not.toContain('deltaInterval');
  });

  it('round-trips intervals, deltas, and bounded windows', () => {
    const wire = serializeQueryTree(group({
      children: [
        valueLeaf({
          valueMode: 'delta',
          deltaInterval: [{count: 2, unit: 'weeks'}, {count: 3, unit: 'days'}],
          operator: QueryOperatorTypes.HAS_CHANGED,
          value: '',
        }),
        valueLeaf({
          timeAggregation: 'within',
          timeWindow: [{count: 1, unit: 'weeks'}],
          valueAggregation: 'average',
        }),
        valueLeaf({
          timeAggregation: 'within_at_least',
          timeWindow: [{count: 1, unit: 'years'}],
          timeWindowCount: 3,
        }),
      ],
      relations: [{
        id: 'relation-1',
        source: 1,
        target: 2,
        kind: 'in_the_following',
        interval: [{count: 1, unit: 'weeks'}],
        atLeast: 1,
        atMost: null,
      }],
    }));

    expect(wire.conditions[0]).toEqual(jasmine.objectContaining({
      valueMode: 'DELTA',
      deltaInterval: [{count: 2, unit: 'WEEKS'}, {count: 3, unit: 'DAYS'}],
    }));
    expect(wire.conditions[1]).toEqual(jasmine.objectContaining({
      timeAggregationMethod: 'WITHIN',
      timeWindow: [{count: 1, unit: 'WEEKS'}],
      valueAggregationMethod: 'AVERAGE',
    }));
    expect(wire.conditions[2]).toEqual(jasmine.objectContaining({
      timeAggregationMethod: 'WITHIN_AT_LEAST',
      timeWindow: [{count: 1, unit: 'YEARS'}],
      timeWindowCount: 3,
    }));
    expect(wire.temporalRelations?.[0]).toEqual({
      sourceCondition: 1,
      targetCondition: 2,
      relationship: 'IN_THE_FOLLOWING',
      interval: [{count: 1, unit: 'WEEKS'}],
      atLeast: 1,
    });
    expect(serializeQueryTree(hydrateQueryTree(wire))).toEqual(wire);
  });

  it('hydrates a stored query from the backend', () => {
    const root = hydrateQueryTree({
      connectingOperator: 'OR',
      conditions: [{
        ontologyId: 'o',
        dataTypeId: 'd',
        operator: 'SMALLER_EQUAL',
        value: '5',
        valueMode: 'DELTA',
        deltaInterval: [{count: 3, unit: 'MONTHS'}],
        timeFilter: {after: '2024-01-01', before: '2025-01-01'},
        timeAggregationMethod: 'LAST',
        atMost: 4,
      }],
      temporalRelations: [{sourceCondition: 0, targetCondition: 1, relationship: 'ANYTIME_AFTER'}],
    });
    const hydrated = root.children[0] as QueryLeafNode;

    expect(root.connectingOperator).toBe('OR');
    expect(hydrated).toEqual(jasmine.objectContaining({
      operator: QueryOperatorTypes.SMALLER_EQUAL,
      value: '5',
      valueMode: 'delta',
      deltaWindow: true,
      deltaInterval: [{count: 3, unit: 'months'}],
      timeFilterChoice: 'between',
      timeAggregation: 'last',
      atMost: 4,
    }));
    expect(root.relations[0]).toEqual(jasmine.objectContaining({source: 0, target: 1, kind: 'anytime_after', interval: []}));
  });

  it('opens a fresh root when the stored query is not a group', () => {
    const root = hydrateQueryTree([{ontologyId: 'old'}]);
    expect(root.kind).toBe('group');
    expect(root.children.length).toBe(1);
    expect(root.children[0].kind).toBe('leaf');
  });

  it('reindexes relations when children move or disappear', () => {
    const tree = group({
      children: [
        valueLeaf(),
        valueLeaf({ontologyId: 'second'}),
        valueLeaf({ontologyId: 'third'}),
      ],
      relations: [{
        id: 'relation-1',
        source: 0,
        target: 2,
        kind: 'same_group',
        interval: [],
        atLeast: null,
        atMost: null,
      }],
    });

    expect(moveChild(tree, 2, -1).relations[0]).toEqual(jasmine.objectContaining({source: 0, target: 1}));
    expect(removeChild(tree, 0).relations).toEqual([]);
  });

  it('describes a nested group with a temporal relationship', () => {
    const nested = group({
      connectingOperator: 'AND',
      children: [
        leaf({
          catalogName: 'age',
          operator: QueryOperatorTypes.BIGGER,
          value: '18',
          valueMode: 'delta',
          deltaInterval: [{count: 1, unit: 'weeks'}],
          timeAggregation: 'first',
        }),
        leaf({catalogName: 'visit', operator: QueryOperatorTypes.EXISTS, value: ''}),
        leaf({
          catalogName: 'score',
          operator: QueryOperatorTypes.BIGGER,
          value: '5',
          valueMode: 'absolute',
          valueAggregation: 'average',
          timeAggregation: 'within',
          timeWindow: [{count: 1, unit: 'years'}],
        }),
      ],
      relations: [{
        id: 'relation-1',
        source: 0,
        target: 1,
        kind: 'same_visit',
        interval: [],
        atLeast: null,
        atMost: null,
      }],
    });
    const root = group({
      connectingOperator: 'OR',
      children: [
        leaf({
          catalogName: 'height',
          operator: QueryOperatorTypes.BIGGER,
          value: '180',
          timeFilterChoice: 'after',
          timeAfter: '2024-01-01',
        }),
        nested,
      ],
    });

    expect(describeQueryGroup(root)).toBe(
      'height > 180 (after 2024-01-01) OR (age > 18 (delta 1 week, first) AND visit exists AND score > 5 (within 1 year, average). 1 same visit 2)'
    );
  });
});

describe('query tree validator', () => {
  function leaf(partial: Partial<QueryLeafNode> = {}): QueryLeafNode {
    return {
      ...createEmptyLeaf(),
      ontologyId: 'ontology',
      dataTypeId: 'datatype',
      operator: QueryOperatorTypes.BIGGER,
      value: '10',
      ...partial,
    };
  }

  function group(children: QueryGroupNode['children'], extra: Partial<QueryGroupNode> = {}): QueryGroupNode {
    return {...createEmptyGroup(false), children, ...extra};
  }

  it('rejects an empty group', () => {
    expect(isQueryTreeValid(createEmptyGroup(false))).toBeFalse();
  });

  it('rejects illegal aggregation and delta combinations', () => {
    expect(codes(group([leaf({valueAggregation: 'average', valueMode: 'delta'})]))).toContain('average-requires-absolute');
    expect(codes(group([leaf({
      timeAggregation: 'within',
      timeWindow: [{count: 1, unit: 'weeks'}],
      valueAggregation: 'None',
    })]))).toContain('within-requires-average');
    expect(codes(group([leaf({
      timeAggregation: 'within_at_least',
      timeWindow: [{count: 1, unit: 'years'}],
      timeWindowCount: 3,
      valueAggregation: 'average',
    })]))).toContain('within-count-average');
    expect(codes(group([leaf({
      operator: QueryOperatorTypes.HAS_CHANGED,
      valueMode: 'absolute',
      value: '',
      timeAggregation: 'first',
    })]))).toContain('change-requires-delta');
    expect(codes(group([leaf({
      operator: QueryOperatorTypes.CHANGED_FROM,
      valueMode: 'delta',
      value: '4',
      valueAggregation: 'average',
    })]))).toContain('change-aggregation');
  });

  it('rejects bad bounds, dates, intervals, and relation endpoints', () => {
    expect(codes(group([leaf({atLeast: 5, atMost: 2})]))).toContain('at-least-above-at-most');
    expect(codes(group([leaf({atLeast: -1})]))).toContain('at-least');
    expect(codes(group([leaf({timeAfter: '2024'})]))).toContain('date-after');
    expect(codes(group([leaf({
      timeAggregation: 'within',
      valueAggregation: 'average',
      timeWindow: [{count: 0, unit: 'days'}],
    })]))).toContain('interval-count');

    const nested = createEmptyGroup();
    const tree = group([leaf(), nested], {
      relations: [{
        id: 'relation-1',
        source: 0,
        target: 0,
        kind: 'same_time',
        interval: [],
        atLeast: null,
        atMost: null,
      }],
    });
    expect(codes(tree)).toContain('relation-same-endpoint');

    const grouped = group([leaf(), nested], {
      relations: [{
        id: 'relation-1',
        source: 0,
        target: 1,
        kind: 'same_group',
        interval: [],
        atLeast: null,
        atMost: null,
      }],
    });
    expect(codes(grouped)).toContain('relation-not-leaf');

    const averaged = group([
      leaf({valueAggregation: 'average', valueMode: 'absolute'}),
      leaf({ontologyId: 'other'}),
    ], {
      relations: [{
        id: 'relation-1',
        source: 0,
        target: 1,
        kind: 'same_group',
        interval: [],
        atLeast: null,
        atMost: null,
      }],
    });
    expect(codes(averaged)).toContain('relation-average');
  });

  it('accepts a same-group pair and a counted text match', () => {
    expect(isQueryTreeValid(group([
      leaf({operator: QueryOperatorTypes.EQUAL, value: '9999-9'}),
      leaf({operator: QueryOperatorTypes.BIGGER, value: '100', timeAggregation: 'first'}),
    ], {
      relations: [{
        id: 'relation-1',
        source: 0,
        target: 1,
        kind: 'same_group',
        interval: [],
        atLeast: null,
        atMost: null,
      }],
    }))).toBeTrue();

    expect(isQueryTreeValid(group([
      leaf({operator: QueryOperatorTypes.CONTAINS, value: 'Employee', catalogType: DataTypes.STRING, atLeast: 2}),
    ]))).toBeTrue();
  });

  it('rejects operators the backend cannot execute', () => {
    expect(codes(group([
      leaf({operator: QueryOperatorTypes.NOT_CONTAINS, value: 'Employee'}),
    ]))).toContain('unsupported-operator');

    expect(codes(group([
      leaf({operator: QueryOperatorTypes.CONTAINS, value: '12', catalogType: DataTypes.INT}),
    ]))).toContain('text-operator-type');

    expect(isQueryTreeValid(group([
      leaf({operator: QueryOperatorTypes.SMALLER, value: '12', catalogType: DataTypes.STRING}),
    ]))).toBeTrue();
  });

  function codes(tree: QueryGroupNode): string[] {
    return validateQueryTree(tree).map(issue => issue.code);
  }
});

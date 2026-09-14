import {QueryOperatorTypes} from '@global-app/find-data/dto/query';

const OPERATOR_LABELS: Record<QueryOperatorTypes, string> = {
  [QueryOperatorTypes.EQUAL]: '=',
  [QueryOperatorTypes.SMALLER]: '<',
  [QueryOperatorTypes.SMALLER_EQUAL]: '<=',
  [QueryOperatorTypes.BIGGER]: '>',
  [QueryOperatorTypes.BIGGER_EQUAL]: '>=',
  [QueryOperatorTypes.NOT_EQUAL]: '!=',
  [QueryOperatorTypes.IN]: 'in',
  [QueryOperatorTypes.NOT_IN]: 'not in',
  [QueryOperatorTypes.EXISTS]: 'exists',
  [QueryOperatorTypes.NOT_EXISTS]: 'not exists',
  [QueryOperatorTypes.REGEX]: 'regex',
  [QueryOperatorTypes.CONTAINS]: 'contains',
  [QueryOperatorTypes.NOT_CONTAINS]: 'not contains',
  [QueryOperatorTypes.START_WIDTH]: 'starts with',
  [QueryOperatorTypes.END_WIDTH]: 'ends with',
};

export function formatQueryOperator(operator: QueryOperatorTypes | string): string {
  const normalizedOperator = operator.replace(/\s+/g, '');

  if (isQueryOperatorType(normalizedOperator)) {
    return OPERATOR_LABELS[normalizedOperator];
  }

  switch (normalizedOperator) {
    case '==':
    case '=':
      return OPERATOR_LABELS[QueryOperatorTypes.EQUAL];

    case '!=':
    case '<>':
      return OPERATOR_LABELS[QueryOperatorTypes.NOT_EQUAL];

    case '>':
      return OPERATOR_LABELS[QueryOperatorTypes.BIGGER];

    case '>=':
      return OPERATOR_LABELS[QueryOperatorTypes.BIGGER_EQUAL];

    case '<':
      return OPERATOR_LABELS[QueryOperatorTypes.SMALLER];

    case '<=':
      return OPERATOR_LABELS[QueryOperatorTypes.SMALLER_EQUAL];

    case 'in':
    case 'IN':
      return OPERATOR_LABELS[QueryOperatorTypes.IN];

    case '!in':
    case 'notin':
    case 'NOTIN':
      return OPERATOR_LABELS[QueryOperatorTypes.NOT_IN];

    case 'exists':
      return OPERATOR_LABELS[QueryOperatorTypes.EXISTS];

    case '!exists':
    case 'notexists':
      return OPERATOR_LABELS[QueryOperatorTypes.NOT_EXISTS];

    case 'regex':
      return OPERATOR_LABELS[QueryOperatorTypes.REGEX];

    case 'contains':
      return OPERATOR_LABELS[QueryOperatorTypes.CONTAINS];

    case '!contains':
    case 'notcontains':
      return OPERATOR_LABELS[QueryOperatorTypes.NOT_CONTAINS];

    case 'startsWith':
    case 'startswith':
      return OPERATOR_LABELS[QueryOperatorTypes.START_WIDTH];

    case 'endsWith':
    case 'endswith':
      return OPERATOR_LABELS[QueryOperatorTypes.END_WIDTH];

    default:
      return normalizedOperator;
  }
}

function isQueryOperatorType(operator: string): operator is QueryOperatorTypes {
  return Object.values(QueryOperatorTypes).includes(operator as QueryOperatorTypes);
}

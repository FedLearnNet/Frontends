import {QueryOperatorTypes} from "@global-app/find-data/dto/query";

export function prettifyOperator(op: QueryOperatorTypes | string): string {
  const m = op.replace(/\s+/g, '');
  switch (m) {
    case QueryOperatorTypes.EQUAL:
    case '==':
      return '=';
    case QueryOperatorTypes.NOT_EQUAL:
    case '!=':
      return '≠';
    case QueryOperatorTypes.BIGGER:
    case '>':
      return '>';
    case QueryOperatorTypes.BIGGER_EQUAL:
    case '>=':
      return '≥';
    case QueryOperatorTypes.SMALLER:
    case '<':
      return '<';
    case QueryOperatorTypes.SMALLER_EQUAL:
    case '<=':
      return '≤';
    case QueryOperatorTypes.NOT_IN:
    case '!in':
      return '∉';
    case QueryOperatorTypes.IN:
    case 'in':
      return '∈';
    case QueryOperatorTypes.EXISTS:
    case 'exists':
      return 'existiert';
    case QueryOperatorTypes.REGEX:
    case 'regex':
      return 'regex';
    default: return m;
  }
}

export function parseValue(value?: string | string[]): string {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');

  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) return arr.join(', ');
    } catch { /* ignore */ }
  }
  return trimmed;
}

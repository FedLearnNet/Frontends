import {isEmpty, isNull} from 'lodash';

interface QueryParams {
  [key: string]: string | number | boolean | null;
}

export function isNotEmpty(value: any): boolean {
  return !isEmpty(value);
}

export function isNotNull(value: any): boolean {
  return !isNull(value);
}

//TODO use loadesh camelCase
export const snakeToCamel = (str: string): string => {
  return str.replace(/_/g, ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

export const replacePlaceholders = (template: string, replacements: { [key: string]: any }): string => {
  const regex = /{([a-zA-Z0-9_]+)}/g;

  return template.replace(regex, (match: string, placeholder: string) => {
    return Object.prototype.hasOwnProperty.call(replacements, placeholder) ? replacements[placeholder] : match;
  });
}

export const concatUnique = (array1: any[], array2: any[]): any => {
  const combinedArray = array1.concat(array2);

  return combinedArray.filter((item, index) => combinedArray.indexOf(item) === index);
}

export const convertObjectKeysToSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((value) => convertObjectKeysToSnakeCase(value));
  } 
  // Added typeof obj === 'object': This checks if obj is indeed an object and not null or undefined.
  else if (obj && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const newKey = toSnakeCase(key);
      result[newKey] = convertObjectKeysToSnakeCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

const toSnakeCase = (str: string): string => {
  return splitCaps(str)
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_');
}

const splitCaps = (string: string): string => string
  .replace(/([a-z])([A-Z]+)/g, (m, s1, s2) => s1 + ' ' + s2)
  .replace(/([A-Z])([A-Z]+)([^a-zA-Z0-9]*)$/, (m, s1, s2, s3) => s1 + s2.toLowerCase() + s3)
  .replace(/([A-Z]+)([A-Z][a-z])/g,
    (m, s1, s2) => s1.toLowerCase() + ' ' + s2);

export const buildQueryString = (params: QueryParams): string => {
  return Object.keys(params)
    .filter(key => params[key] !== null)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key])))
    .join('&');
}

export const getSchemaFormName = (value: string, label: string): string => {
  if (label.toLowerCase() === value.toLowerCase()) {
    return value;
  }
  return `${value} (${label})`;
}

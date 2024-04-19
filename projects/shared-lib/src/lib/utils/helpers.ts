import { isEmpty, isNull } from 'lodash';

export function isNotEmpty(value: any): boolean {
    return !isEmpty(value);
}

export function isNotNull(value: any): boolean {
    return !isNull(value);
}

export const snakeToCamel = (str: string): string => {
    return str.replace(/_/g, ' ').replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
}

export const replacePlaceholders = (template: string, replacements: { [key: string]: any }): string  => {
    const regex = /{([a-zA-Z0-9_]+)}/g;

    return template.replace(regex, (match: string, placeholder: string) => {
        return replacements.hasOwnProperty(placeholder) ? replacements[placeholder] : match;
    });
}

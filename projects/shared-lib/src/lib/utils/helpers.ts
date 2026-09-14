import {isEmpty, isNull} from 'lodash';
import {UploadInfoDTO} from '../../../../local-app/src/app/modules/connector/dto/upload-info';
import {ConnectorDTO} from '../../../../local-app/src/app/modules/connector/dto/connector';

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

export const buildQueryString = (params: QueryParams): string => {
  return Object.keys(params)
    .filter(key => params[key] !== null)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key])))
    .join('&');
}

export const getSchemaFormName = (schemaNodeName: string, dataTypeName: string): string => {
  if (dataTypeName.toLowerCase() === schemaNodeName.toLowerCase()) {
    return schemaNodeName;
  }
  return `${schemaNodeName} (${dataTypeName})`;
}

export function capitalizeFirstLetter(val: string) {
  const vlow = val.toLowerCase();
  return String(val).charAt(0).toUpperCase() + String(vlow).slice(1);
}


export function hasValidFileInfo(
  fileInfo: Record<string, UploadInfoDTO> | null | undefined): boolean {

  if (!fileInfo) {
    return false;
  }

  return Object.values(fileInfo).some(
    dto => typeof dto.json === 'string' && dto.json.trim().length > 0
  );
}

export function getPrimarySheet(fileInfo: Record<string, UploadInfoDTO> | undefined): UploadInfoDTO | undefined {
  if (!fileInfo) {
    return undefined;
  }
  const keys = Object.keys(fileInfo);
  return keys.length > 0 ? fileInfo[keys[0]] : undefined;
}

export function capitalizeText(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function setMissingFileInfo(connector: ConnectorDTO): ConnectorDTO {
  const currentUploadInfo = connector?.uploadInfo;
  const currentFileInfo = connector?.fileInfo
    ?? (currentUploadInfo && !Array.isArray(currentUploadInfo) && 'json' in currentUploadInfo
      ? {['0']: currentUploadInfo}
      : undefined);
  const updatedFileInfo: Record<string, UploadInfoDTO> = {};

  if (!currentFileInfo) {
    return connector;
  }

  Object.entries(currentFileInfo as Record<string, UploadInfoDTO>).forEach(([sheetName, info]) => {
    updatedFileInfo[sheetName] = {
      ...info,
      fileExists: false,
    };
  });

  return {
    ...connector,
    fileInfo: updatedFileInfo,
  }
}

import { DataTypeTypeEnum } from "@local-app/cohort/dto/data-type";

/** Java DateTimeFormatter pattern for ISO-8601 UTC timestamps. */
export const VISIT_TIMESTAMP_FORMAT_ISO = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

const LEGACY_VISIT_TIMESTAMP_FORMATS = new Set([
  'ISO_8601',
  'ISO-8601',
  'YYYY-MM-DDTHH:mm:ss.SSSZ',
]);

export function normalizeVisitTimestampFormat(format: string | undefined): string | undefined {
  if (!format) return undefined;
  if (LEGACY_VISIT_TIMESTAMP_FORMATS.has(format)) {
    return VISIT_TIMESTAMP_FORMAT_ISO;
  }
  return format;
}

export function toLocalFormDateTimeString(dateTime: string) {
  if (!dateTime) {
    return null;
  }
  const d = new Date(dateTime);
  return d.toISOString().slice(0, 16);
}

export function parseValueForBackend(foundValue: unknown, dataType: DataTypeTypeEnum): string | number | boolean | null {
  let value: string | number | boolean | null = String(foundValue);
  if (dataType === DataTypeTypeEnum.BOOLEAN) {
    if (typeof foundValue === 'boolean') {
      value = foundValue;
    } else if (typeof foundValue === 'string') {
      value = foundValue.toLowerCase() === 'true';
    } else {
      value = false;
    }
  } else if (dataType === DataTypeTypeEnum.FLOAT) {
    if (typeof foundValue === 'number') {
      value = foundValue;
    } else if (foundValue === '' || foundValue == null) {
      value = null;
    } else {
      value = parseFloat(String(foundValue));
    }
  } else if (dataType === DataTypeTypeEnum.INT) {
    if (typeof foundValue === 'number') {
      value = foundValue;
    } else if (foundValue === '' || foundValue == null) {
      value = null;
    } else {
      value = parseInt(String(foundValue), 10);
    }
  } else if (dataType === DataTypeTypeEnum.DATE_TIME) {
    const instant = new Date(value);
    value = instant.toISOString();
  }
  return value;
}

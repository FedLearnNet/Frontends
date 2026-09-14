import {
  AppBasedUploadSettings,
  ConnectorInputConfig,
  FileUploadSettings
} from "../models/input-config";
import {ConnectorFilesDetailDTO, UploadInfoDTO} from "../dto/upload-info";
import {ConnectorDTO, ConnectorTransformerDTO, SheetMergeResultDTO} from '../dto/connector';
import {ConnectorMappingConfig} from "../models/connector-model";
import {FunctionsDetailDTO} from "../dto/function";
import {UNIQUE_PATIENT_ID_NODE} from "@local-app/utils/constants/unique-patient-id-node";
import {ColumnProfile} from '@shared-lib/modules/files/dto/file';

/**
 * Normalizes a sheet name for comparison by converting to lowercase and removing underscores.
 */
function normalizeSheetName(name: string): string {
  return name.toLowerCase().replace(/[_ ]/g, '');
}

function findNormalizedSheetName(
  sheetName: string,
  sheetUidMapping: Record<string, string>): string | undefined {
  const normalized = normalizeSheetName(sheetName);
  for (const [key, value] of Object.entries(sheetUidMapping)) {
    if (normalizeSheetName(key) === normalized) {
      return value;
    }
  }
  return undefined;
}

const parseRows = (dto: UploadInfoDTO): Record<string, UploadInfoDTO>[] => {
  if (dto.data?.length) return dto.data;

  if (!dto.json) return [];

  return typeof dto.json === 'string'
      ? JSON.parse(dto.json)
      : dto.json;
};

const renameKeys = (row: Record<string, UploadInfoDTO>, renameMap: Map<string, string>): Record<string, UploadInfoDTO> => {
  return Object.entries(row).reduce<Record<string, UploadInfoDTO>>((acc, [key, value]) => {
    acc[renameMap.get(key) ?? key] = value;
    return acc;
  }, {});
};

function renameDuplicateColumns(
    entries: [sheetName: string, dto: UploadInfoDTO][],
    sheetUidMapping: Record<string, string>
): void {
  const columnCount = new Map<string, number>();

  for (const [sheetName, dto] of entries) {
    const normalized = findNormalizedSheetName(sheetName, sheetUidMapping);

    for (const col of dto.columns) {
      if (col !== normalized) {
        columnCount.set(col, (columnCount.get(col) ?? 0) + 1);
      }
    }
  }

  for (const [sheetName, dto] of entries) {
    const normalized = findNormalizedSheetName(sheetName, sheetUidMapping);

    const renameMap = new Map<string, string>();

    for (const col of dto.columns) {
      if (col !== normalized && (columnCount.get(col) ?? 0) > 1) {
        renameMap.set(col, `${sheetName}::${col}`);
      }
    }

    if (!renameMap.size) continue;

    dto.columns = dto.columns.map(col => renameMap.get(col) ?? col);
    dto.renamedColumns = dto.renamedColumns.map(col => renameMap.get(col) ?? col);

    dto.columnProfiles = dto.columnProfiles?.map(profile =>
        renameMap.has(profile.name)
            ? { ...profile, name: renameMap.get(profile.name)! }
            : profile
    );

    dto.data = dto.data.map(row => renameKeys(row, renameMap));
    dto.json = JSON.stringify(dto.data);
  }
}

export function mergeFileInfo(
    fileInfoMap: Record<string, UploadInfoDTO>,
    mergeConfig: SheetMergeResultDTO
): Record<string, UploadInfoDTO> {
  const entries = Object.entries(fileInfoMap);
  if (entries.length < 2) return fileInfoMap;

  const { commonUidColumnName, sheetUidMapping } = mergeConfig;

  renameDuplicateColumns(entries, sheetUidMapping);

  const allColumnsSet = new Set<string>();

  for (const [sheetName, dto] of entries) {
    const normalized = findNormalizedSheetName(sheetName, sheetUidMapping);

    for (const col of dto.columns) {
      const qualifiedUid = `${sheetName}::${normalized}`;
      if (col !== normalized && col !== qualifiedUid) {
        allColumnsSet.add(col);
      }
    }
  }

  const allColumns = [commonUidColumnName, ...allColumnsSet];
  const allDeletedColumns = allColumns.map(() => false);

  const allRows: Record<string, UploadInfoDTO>[] = [];
  const mergedProfiles: ColumnProfile[] = [];
  let commonUidProfile: ColumnProfile | undefined;

  for (const [sheetName, dto] of entries) {
    const normalized = findNormalizedSheetName(sheetName, sheetUidMapping);
    if (!normalized) continue;

    const uidKey =
        dto.columns.find(
            col => col === normalized || col === `${sheetName}::${normalized}`
        ) ?? normalized;

    const rows = parseRows(dto);

    for (const profile of dto.columnProfiles ?? []) {
      if (profile.name === uidKey || profile.name === normalized) {
        commonUidProfile ??= {...profile, name: commonUidColumnName};
      } else if (allColumnsSet.has(profile.name)) {
        mergedProfiles.push(profile);
      }
    }

    for (const row of rows) {
      const uid = row[uidKey] ?? row[normalized];
      if (uid == null) continue;

      const newRow: Record<string, UploadInfoDTO> = { [commonUidColumnName]: uid };

      for (const [key, value] of Object.entries(row)) {
        if (key !== uidKey && key !== normalized) {
          newRow[key] = value;
        }
      }

      allRows.push(newRow);
    }
  }

  allRows.sort((a, b) =>
      String(a[commonUidColumnName]).localeCompare(
          String(b[commonUidColumnName]),
          undefined,
          { numeric: true, sensitivity: 'base' }
      )
  );

  const limitedData = allRows.slice(0, 10);

  return {
    Merged: {
      json: JSON.stringify(limitedData),
      data: limitedData,
      columns: allColumns,
      renamedColumns: [...allColumns],
      deletedColumns: allDeletedColumns,
      columnProfiles: commonUidProfile ? [commonUidProfile, ...mergedProfiles] : mergedProfiles,
    }
  };
}

export function connectorFilesDetailToFileInfo(
  detail: ConnectorFilesDetailDTO
): Record<string, UploadInfoDTO> {
  const fileInfo = detail.uploadInfo?.reduce<Record<string, UploadInfoDTO>>((acc, sheetInfo, index) => {
    const detectedSheetName = sheetInfo.sheet?.trim();
    const isDefaultSingleTableName = detail.uploadInfo.length === 1 && detectedSheetName === String(index);
    const sheetName = detectedSheetName && !isDefaultSingleTableName
      ? detectedSheetName
      : (detail.uploadInfo.length === 1 && detail.fileName ? detail.fileName : String(index));
    const data = parseSheetJson(sheetInfo.json);

    acc[sheetName] = {
      ...sheetInfo,
      sheet: sheetName,
      json: sheetInfo.json ?? '[]',
      data,
      renamedColumns: sheetInfo.renamedColumns ?? sheetInfo.columns ?? [],
      deletedColumns: sheetInfo.deletedColumns ?? new Array(sheetInfo.columns?.length ?? 0).fill(false),
    };

    return acc;
  }, {}) ?? {};

  hydrateFileInfoData(fileInfo);
  return fileInfo;
}

export function hydrateFileInfoData(fileInfo: Record<string, UploadInfoDTO>): void {
  for (const dto of Object.values(fileInfo)) {
    if (!dto.data?.length && dto.json) {
      dto.data = parseSheetJson(dto.json);
    }
  }
}

function parseSheetJson(json: string | undefined): any[] {
  if (!json) {
    return [];
  }

  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isFileUploadSettings(
  cfg: ConnectorInputConfig
): cfg is FileUploadSettings {
  return cfg?.mode === 'FILE';
}

export function isAppBasedUploadSettings(
  cfg: ConnectorInputConfig
): cfg is AppBasedUploadSettings {
  return cfg.mode === 'APP';
}

export function getBaseColumnName(columnName: string, sheetName: string): string {
  return columnName.replace(`${sheetName}::`, '');
}

/**
 * The source column that is mapped to the unique patient id schema node, if any.
 * Mappings store the schema path joined by node names, so a patient id mapping resolves
 * to the patient id node name.
 */
export function getPatientIdMappedColumn(
  schemaMapping?: ConnectorMappingConfig[]
): string | undefined {
  return schemaMapping?.find(mapping => mapping.mapping === UNIQUE_PATIENT_ID_NODE.name)?.column;
}

/**
 * All source columns a transformer creates or overwrites, gathered from both its
 * `column` (comma separated) and the values of its `returnMapping`.
 */
export function getTransformerOutputColumns(
  transformer: ConnectorTransformerDTO | FunctionsDetailDTO
): string[] {
  const columns: string[] = [];

  if (transformer.column) {
    columns.push(...transformer.column.split(',').map(column => column.trim()));
  }

  if (transformer.returnMapping) {
    columns.push(...Object.values(transformer.returnMapping).map(value => String(value).trim()));
  }

  return columns.filter(column => !!column);
}

/**
 * The unique patient id may only be mapped to a source column that is not produced or
 * overwritten by a transformer. Returns the conflicting column name when the current
 * mapping is invalid, or undefined when it is valid.
 */
export function getPatientIdTransformerConflict(
  schemaMapping?: ConnectorMappingConfig[],
  transformers?: Array<ConnectorTransformerDTO | FunctionsDetailDTO>
): string | undefined {
  const patientIdColumn = getPatientIdMappedColumn(schemaMapping);
  if (!patientIdColumn || !transformers?.length) {
    return undefined;
  }

  const producedByTransformer = transformers.some(transformer =>
    getTransformerOutputColumns(transformer).includes(patientIdColumn)
  );

  return producedByTransformer ? patientIdColumn : undefined;
}

export function getCleanConnectorConfig(connector: ConnectorDTO): ConnectorDTO {
  const transformerConfig = connector.transformer?.length
      ? connector.transformer.map(item => ({
        ...item,
        connectorId: undefined
      }))
      : undefined;

  return {
    ...connector,
    inputConfig: {
      ...connector.inputConfig,
      fileExists: false,
      fileId: null,
    },
    cohortId: undefined,
    transformer: transformerConfig,
    lastRun: {},
  } as ConnectorDTO;
}

import {ConnectorCard, getConnectorCard} from "./connector-card";
import {AppBasedUploadSettings, ConnectorInputConfig, FileUploadSettings} from "./input-config";
import {ConnectorConfigDTO as PreviewConnectorConfigDTO} from "../dto/preview";
import {UploadInfoDTO} from "../dto/upload-info";
import {FunctionExecutionMode, FunctionsDetailDTO} from "../dto/function";
import {ConnectorMappingConfig} from "./connector-model";
import {ConnectorStepConfigs} from "../enum/connector-step-config";
import {
  ConnectorDTO,
  ConnectorInputConfigDTO,
  ConnectorMappingDTO,
  ConnectorTransformerDTO,
  PivotConfigDTO
} from "../dto/connector";
import {hydrateFileInfoData, isAppBasedUploadSettings} from "../helper/connector-config-helper";

function getPrimaryUploadInfo(
  fileInfo?: Record<string, UploadInfoDTO> | UploadInfoDTO
): UploadInfoDTO | undefined {
  if (!fileInfo) {
    return undefined;
  }
  if (!('0' in (fileInfo as Record<string, UploadInfoDTO>)) && 'json' in fileInfo) {
    return fileInfo as UploadInfoDTO;
  }
  const [firstSheet] = Object.values(fileInfo);
  return firstSheet;
}

function normalizeFileInfoMap(
  fileInfo?: Record<string, UploadInfoDTO> | UploadInfoDTO
): Record<string, UploadInfoDTO> | undefined {
  if (!fileInfo) {
    return undefined;
  }

  if ('json' in fileInfo) {
    const uploadInfo = fileInfo as UploadInfoDTO;
    return {
      [uploadInfo.sheet ?? '0']: uploadInfo,
    };
  }

  return fileInfo as Record<string, UploadInfoDTO>;
}

function compactFileInfoMap(
  fileInfo?: Record<string, UploadInfoDTO> | UploadInfoDTO
): Record<string, UploadInfoDTO> | undefined {
  const normalized = normalizeFileInfoMap(fileInfo);
  if (!normalized) {
    return undefined;
  }

  return Object.fromEntries(Object.entries(normalized).map(([name, info]) => [
    name,
    {
      sheet: info.sheet,
      json: info.json,
      columns: info.columns,
      renamedColumns: info.renamedColumns,
      deletedColumns: info.deletedColumns,
      lastUploaded: info.lastUploaded,
      fileExists: info.fileExists,
    } as UploadInfoDTO,
  ]));
}

/**
 * Creates the resumable browser draft without duplicated or derived file data.
 */
export function configToConnectorDraft(config: ConnectorDTO): ConnectorDTO {
  const fileInfo = compactFileInfoMap(config.fileInfo ?? config.uploadInfo);
  return {
    ...config,
    fileInfo,
    uploadInfo: undefined,
  };
}

/**
 * Restores the derived fields omitted from the compact browser draft.
 */
export function connectorDraftToConfig(draft: ConnectorDTO): ConnectorDTO {
  const fileInfo = compactFileInfoMap(draft.fileInfo ?? draft.uploadInfo);
  if (!fileInfo) {
    return draft;
  }

  hydrateFileInfoData(fileInfo);
  return {
    ...draft,
    fileInfo,
    uploadInfo: fileInfo,
  };
}

function sanitizeInputConfig(
  inputConfig?: ConnectorInputConfig
): ConnectorInputConfigDTO | undefined {
  if (!inputConfig) {
    return undefined;
  }

  const {file, ...rest} = inputConfig as ConnectorInputConfig & {
    file?: File | null;
    fileId?: number | null;
  };

  return rest as ConnectorInputConfigDTO;
}

function normalizePivotConfig(pivotConfig?: PivotConfigDTO): PivotConfigDTO | undefined {
  if (!pivotConfig || Object.keys(pivotConfig.valueColumnIndex).length === 0) {
    return undefined;
  }

  return {
    valueColumnIndex: {...pivotConfig.valueColumnIndex},
    mode: pivotConfig.mode ? {...pivotConfig.mode} : undefined,
    prefix: pivotConfig.prefix ? {...pivotConfig.prefix} : undefined,
    valueFormat: pivotConfig.valueFormat ? {...pivotConfig.valueFormat} : undefined,
  };
}

function normalizeTransformer(transformer: FunctionsDetailDTO | ConnectorTransformerDTO): FunctionsDetailDTO {
  const mode = transformer.mode ?? FunctionExecutionMode.CELL;
  const usesMappings = mode !== FunctionExecutionMode.CELL;

  return {
    moduleName: transformer.moduleName ?? '',
    methodName: transformer.methodName ?? '',
    parameters: 'parameters' in transformer ? transformer.parameters ?? [] : [],
    returnKeys: 'returnKeys' in transformer ? transformer.returnKeys ?? [] : [],
    column: transformer.column ?? null,
    mode,
    inputMapping: usesMappings ? convertToDict(transformer.inputMapping) : transformer.inputMapping,
    returnMapping: usesMappings ? convertToDict(transformer.returnMapping) : transformer.returnMapping,
    description: 'description' in transformer ? transformer.description ?? '' : '',
    appVersionId: transformer.appVersionId as any ?? null,
    appImage: transformer.appImage ?? null,
    hyperparams: transformer.hyperparams ? convertToDict(transformer.hyperparams) : transformer.hyperparams,
  };
}

function getSchemaMapping(config: ConnectorDTO): ConnectorMappingDTO[] {
  return config.schemaMapping
    ?.filter(mapping => !!mapping.mapping || !!mapping.valueMappingConfig)
    .map(mapping => ({
      column: mapping.column,
      mapping: mapping.mapping,
      schemaId: mapping.schemaId,
      visitTimestampMapping: mapping.visitTimestampMapping,
      visitIdMapping: mapping.visitIdMapping,
      timestampFormat: mapping.timestampFormat,
      valueMappingConfig: mapping.valueMappingConfig
        ? {
          mode: mapping.valueMappingConfig.mode,
          mappingColumn: mapping.valueMappingConfig.mappingColumn,
          valueColumn: mapping.valueMappingConfig.valueColumn,
          valueMappings: mapping.valueMappingConfig.valueMappings.map(valueMapping => ({...valueMapping})),
        }
        : undefined,
    })) ?? [];
}

export function configToConnectorDTO(config: ConnectorDTO): ConnectorDTO {
  const fileInfo = config.fileInfo ?? config.uploadInfo;
  return {
    id: config.id,
    version: config.version,
    createdAt: config.createdAt as any,
    updatedAt: config.updatedAt as any,
    name: config.name ?? "",
    description: config.description ?? "",
    cohortId: config.cohortId ? Number(config.cohortId) : undefined,
    inputConfig: sanitizeInputConfig(config.inputConfig),
    uploadInfo: normalizeFileInfoMap(fileInfo),
    fileInfo: normalizeFileInfoMap(fileInfo),
    transformer: config.transformer?.map(normalizeTransformer) as ConnectorTransformerDTO[] | undefined,
    schemaMapping: getSchemaMapping(config),
    mergeConfig: config.mergeConfig,
    pivotConfig: normalizePivotConfig(config.pivotConfig),
    triggerSettings: config.triggerSettings,
    scheduleSettings: config.scheduleSettings,
  };
}

export function configToConnectorConfigDTO(config: ConnectorDTO): PreviewConnectorConfigDTO {
  return {
    connectorId: config.id ? Number(config.id) : undefined,
    cohortId: config.cohortId ? Number(config.cohortId) : undefined,
    inputConfig: sanitizeInputConfig(config.inputConfig),
    fileInfo: getPrimaryUploadInfo(config.fileInfo ?? config.uploadInfo),
    transformer: config.transformer?.map(normalizeTransformer) as ConnectorTransformerDTO[] | undefined,
    schemaMapping: getSchemaMapping(config),
    mergeConfig: config.mergeConfig,
    pivotConfig: normalizePivotConfig(config.pivotConfig),
  };
}

function convertToDict(jsonString: any): { [key: string]: string } {

  if (!jsonString || typeof jsonString !== 'string') {
    return jsonString;
  }
  jsonString = jsonString.replace(/'/g, '"');
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON string:', error);
    return jsonString;
  }
}

export function connectorDTOToConfig(config: ConnectorDTO): ConnectorDTO {
  const source = config.inputConfig ? getConnectorCard(config.inputConfig) : undefined;
  const storedFileInfo = normalizeFileInfoMap(config.fileInfo ?? config.uploadInfo);
  const hydratedFileInfo = storedFileInfo
    ? Object.fromEntries(
      Object.entries(storedFileInfo).map(([sheetName, info]) => [
        sheetName,
        {
          ...(info ?? {} as UploadInfoDTO),
          data: info?.data ?? [],
        }
      ])
    )
    : undefined;

  const schemaMapping: ConnectorMappingConfig[] = config.schemaMapping
    ? config.schemaMapping.map(mapping => ({
      column: mapping.column ?? "",
      mapping: mapping.mapping,
      schemaId: mapping.schemaId,
      visitTimestampMapping: mapping.visitTimestampMapping,
      visitIdMapping: mapping.visitIdMapping,
      timestampFormat: mapping.timestampFormat,
      valueMappingConfig: mapping.valueMappingConfig
        ? {
          ...mapping.valueMappingConfig,
          valueMappings: mapping.valueMappingConfig.valueMappings.map(valueMapping => ({...valueMapping})),
        }
        : undefined,
    }))
    : [];
  return {
    id: config.id,
    version: config.version,
    name: config.name,
    description: config.description,
    cohortId: config.cohortId,
    createdAt: config.createdAt as any,
    updatedAt: config.updatedAt as any,
    inputSource: source,
    inputConfig: config.inputConfig as FileUploadSettings | AppBasedUploadSettings | undefined,
    transformer: config.transformer?.map(normalizeTransformer),
    schemaMapping: schemaMapping,
    fileInfo: hydratedFileInfo,
    uploadInfo: hydratedFileInfo,
    mergeConfig: config.mergeConfig,
    pivotConfig: normalizePivotConfig(config.pivotConfig),
    triggerSettings: config.triggerSettings,
    scheduleSettings: config.scheduleSettings,
  };
}


export function configToCards(config: ConnectorDTO): ConnectorCard[] {
  const cards: ConnectorCard[] = [];
  // Always add the source card
  cards.push({
    index: 0,
    title: 'Source',
    configured: true,
    step: ConnectorStepConfigs.STEP_SOURCE_CONFIG,
    type: 'CONFIG'
  });

  // Add additional cards based on the config
  if (config.inputSource) {

    const name: string = config.inputSource.title;
    const card: ConnectorCard = {
      index: 1,
      title: name + " settings",
      configured: false,
      step: config.inputSource.configName,
      type: 'CONFIG'
    };
    if (config.inputSource.configName === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG) {
      const name: string | undefined = config.inputConfig && 'fileType' in config.inputConfig
        ? config.inputConfig.fileType
        : undefined;
      card.content = "FileType: " + (name ?? 'Not specified');
      card.configured = true;
    }
    if (config.inputSource.configName === ConnectorStepConfigs.STEP_SOURCE_APP_BASED) {
      if (isAppBasedUploadSettings(config.inputConfig!)) {
        card.configured = true;
      }
    }
    cards.push(card);
  }

  if (config.inputConfig) {
    cards.push({
      index: 2, title: " Specify headers",
      configured: true,
      step: ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
      type: 'CONFIG'
    });
  }
  // Add transform cards if they exist in the config
  if (config.transformer) {
    config.transformer.forEach((transformer, index) => {
      cards.push({
        index: cards.length > 2 ? cards.length : 3,
        title: transformer.methodName || 'Transformer',
        step: ConnectorStepConfigs.TRANSFORM,
        type: 'TRANSFORM',
        id: index.toString()
      });
    });
  }
  return cards;
}

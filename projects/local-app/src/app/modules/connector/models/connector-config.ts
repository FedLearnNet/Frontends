import {ConnectorCard, ConnectorSourceCard, getConnectorCard} from "./connector-card";
import {FileUploadSettings} from "./input-config";
import {UploadInfoDTO} from "../dto/upload-info";
import {FunctionsDetailDTO, functionToDetailCard} from "../dto/function";
import {ConnectorMappingConfig} from "./connector-model";
import {ConnectorStepConfigs} from "../enum/connector-step-config";

export interface ConnectorConfig {
  id?: number;
  name?: string;
  description?: string;
  schemaId?: string;

  inputSource?: ConnectorSourceCard;
  inputConfig?: FileUploadSettings;

  transformer?: FunctionsDetailDTO[];
  schemaMapping?: ConnectorMappingConfig[];
  fileInfo?: UploadInfoDTO;
}


export interface ConnectorConfigDTO {
  id?: number;
  name: string;
  description: string;
  schemaId?: string;

  inputConfig?: FileUploadSettings;
  uploadInfo?: UploadInfoDTO;

  transformer?: FunctionsDetailDTO[];
  schemaMapping?: { [k: string]: string };
}

export function configToConnectorConfigDTO(config: ConnectorConfig): ConnectorConfigDTO {
  const schemaMappingObject = config.schemaMapping
    ? Object.fromEntries(config.schemaMapping.map(mapping => [mapping.column, mapping.mapping]))
    : {};

  return {
    id: config.id,
    name: config.name!,
    description: config.description!,
    inputConfig: config.inputConfig,
    uploadInfo: config.fileInfo,
    transformer: config.transformer,
    schemaMapping:  schemaMappingObject,
    schemaId: config.schemaId
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

export function connectorConfigDTOToConfig(config: ConnectorConfigDTO): ConnectorConfig {

  const source = config.inputConfig ? getConnectorCard(config.inputConfig!.mode) : undefined;

  let schemaMapping: ConnectorMappingConfig[] = [];
  if (config.schemaMapping) {
    const currentMapping = config.schemaMapping as any as { [key: string]: string };
    schemaMapping = Object.entries(currentMapping).map(([key, value]) => {
      return {column: key, mapping: value};
    });
  }


  return {
    id: config.id,
    name: config.name,
    description: config.description,
    schemaId: config.schemaId,

    inputSource: source,
    inputConfig: config.inputConfig,
    transformer: config.transformer?.map((transformer) => {
      if (transformer.onRow === undefined) {
        transformer.onRow = !transformer.column;
      }
      if (transformer.onRow) {
        transformer.inputMapping = convertToDict(transformer.inputMapping);
        transformer.returnMapping = convertToDict(transformer.returnMapping);
      }
      return transformer;
    }),
    schemaMapping: schemaMapping,
    fileInfo: config.uploadInfo
  };
}


export function configToCards(config: ConnectorConfig): ConnectorCard[] {
  const cards: ConnectorCard[] = [];
  // Always add the source card
  cards.push({
    index: 0,
    title: 'Source',
    content: 'Configured',
    step: ConnectorStepConfigs.STEP_SOURCE_CONFIG,
    type: 'CONFIG'
  });

  // Add additional cards based on the config
  if (config.inputSource) {

    const name: string = config.inputSource.title;
    const card: ConnectorCard = {
      index: 1,
      title: name + " Settings",
      content: 'Need to be configured',
      step: config.inputSource.configName,
      type: 'CONFIG'
    };
    if (config.inputSource.configName === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG) {
      const name: string | undefined = config.inputConfig?.fileType;
      card.content = "FileType: " + (name ?? 'Not specified');    }
    cards.push(card);
  }

  if (config.inputConfig) {
    cards.push({
      index: 2, title: " Specify Headers",
      content: 'Configured', step: ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
      type: 'CONFIG'
    });
  }
  // Add transform cards if they exist in the config
  if (config.transformer) {
    config.transformer.forEach((transformer, index) => {
      cards.push({
        index: cards.length > 2 ? cards.length : 3,
        title: transformer.methodName || 'Transformer',
        content: functionToDetailCard(transformer),
        step: ConnectorStepConfigs.TRANSFORM,
        type: 'TRANSFORM',
        id: index.toString()
      });
    });
  }
  return cards;
}

import {ConnectorInputConfig} from "./input-config";
import {isAppBasedUploadSettings} from "../helper/connector-config-helper";
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {ConnectorStepConfigs} from "../enum/connector-step-config";

export interface ConnectorCard {
  index: number;
  title: string;
  content?: string;
  step: string | number;
  type: 'CONFIG' | 'TRANSFORM' | 'MAPPING';
  id?: string;
  previewRunning?: boolean;
  configured?: boolean;
  optional?: boolean;
}


export interface ConnectorSourceCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  configName: string;
  subName?: string;
}


export const globalGenericSource: ConnectorSourceCard[] = [
  {
    id: "file_upload",
    title: 'File Import',
    description: 'Import an Excel, CSV or JSON file.',
    icon: 'upload_file',
    configName: 'source_file_config'
  },
  {
    id: "ftp",
    title: 'FTP/SFTP',
    description: 'Pull in an Excel, CSV, or JSON file from an FTP or SFTP server.',
    icon: 'folder_open', configName: 'source_input_config'
  },
  {
    id: "function",
    title: 'Function',
    description: 'Invoke a custom python function to fetch JSON data.',
    icon: 'function',
    configName: 'source_function_config'
  },
];


export function storeItemToCard(item: StoreDTO) {
  const app = item.app;
  if (!app) return;
  return {
    id: "" + app!.latestVersionId,
    title: app!.name,
    description: app!.shortDescription,
    icon: 'archive',
    configName: ConnectorStepConfigs.STEP_SOURCE_APP_BASED
  } as ConnectorSourceCard;
}

export function getConnectorCard(config?: ConnectorInputConfig): ConnectorSourceCard | undefined {
  const mode = config?.mode;
  if (!mode) {
    return undefined;
  }
  switch (mode) {
    case 'FILE':
      return globalGenericSource.find((source) => source.id === 'file_upload')!;
    case 'FTP':
      return globalGenericSource.find((source) => source.id === 'ftp')!;
    case 'FUNCTION':
      return globalGenericSource.find((source) => source.id === 'function')!;
    case 'APP':
      if (config && isAppBasedUploadSettings(config)) {
        return {
          id: "" + config.appVersionId,
          title: config.appTitle,
          description: config.appTitle, //description does not exist, but its anyway just for id check
          icon: 'archive',
          configName: ConnectorStepConfigs.STEP_SOURCE_APP_BASED
        } as ConnectorSourceCard;
      }
      return undefined;
    default:
      throw new Error('Invalid mode');
  }
}

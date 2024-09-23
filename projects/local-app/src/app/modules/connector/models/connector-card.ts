export interface ConnectorCard {
  index: number;
  title: string;
  content: string;
  step: string | number;
  type: 'CONFIG' | 'TRANSFORM' | 'MAPPING';
  id?: string;
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
    title: 'File Upload',
    description: 'Upload an Excel, CSV or JSON file.',
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

export const globalNativeSource: ConnectorSourceCard[] = [
  // {
  //   id: "dAIbetes",
  //   title: 'dAIbetes',
  //   description: 'Extract data for dAIbetes',
  //   icon: 'glucose',
  //   configName: 'dAIbetes'
  // },
  // {
  //   id: "microBiome",
  //   title: 'microBiome',
  //   description: 'Extract data for microBiome.',
  //   icon: 'microbiology',
  //   configName: 'microBiome'
  // },
];


export function getConnectorCard(mode: string | undefined): ConnectorSourceCard | undefined {
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
    default:
      throw new Error('Invalid mode');
  }
}

import {ImportEventDTO} from './import-progress';

export interface ImportUploadSettings {
  fileType?: string;
  delimiter?: string;
  customDelimiter?: string;
  hasHeader?: boolean;
  firstSheetOnly?: boolean;
  hasSupportFile?: boolean;
  deleteUnneededFileAfterSuccess?: boolean;
  supportFile?: boolean;
  previewRows?: number;
}

export type ImportStreamMessage =
  | {kind: 'upload'; loaded: number; total: number; percent: number}
  | {kind: 'event'; event: ImportEventDTO};

import {StoreConfig} from '@shared-lib/models';

export interface StoreSelectDialogData {
  allowMaximize?: boolean;
  storeConfig?: StoreConfig;
  // translation key, defaults to MENU.SELECT_APP
  title?: string;
}

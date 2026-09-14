import { ConfirmDialog } from './confirm-dialog';

export interface ConfirmDialogWithSettings extends ConfirmDialog {
  settings?: ConfirmDialogSetting[];
}

export interface ConfirmDialogWithSettingsResult {
  confirmed: boolean;
  settings?: { [key: string]: boolean };
}

type ConfirmDialogSetting = {
  key: string;
  label: string;
  value: boolean;
};

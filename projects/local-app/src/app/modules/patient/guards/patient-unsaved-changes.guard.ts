import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface HasPatientUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const patientUnsavedChangesGuard: CanDeactivateFn<HasPatientUnsavedChanges> = (component) => {
  if (!component?.hasUnsavedChanges?.()) {
    return true;
  }

  const translate = inject(TranslateService);
  const title = translate.instant('DIALOG.UNSAVED_PATIENT_CHANGES.TITLE');
  const message = translate.instant('DIALOG.UNSAVED_PATIENT_CHANGES.MESSAGE');
  return confirm(`${title}\n\n${message}`);
};

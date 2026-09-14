import Keycloak from 'keycloak-js';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {getCurrentPath, isReauthenticationPending, reauthenticate} from '@shared-lib/services/keycloak';
import {TranslateService} from '@ngx-translate/core';

/** Notifies the user and redirects to Keycloak login after session expiry. */
export const notifySessionExpiredAndReauthenticate = (
  keycloak: Keycloak,
  errorSnackbarService: ApiErrorSnackbarService,
  translate: TranslateService,
): void => {
  if (isReauthenticationPending()) {
    return;
  }

  reauthenticate(keycloak, getCurrentPath());
  errorSnackbarService.showSnackBarOnlyText(
    {status: 401},
    translate.instant('ERROR.SESSION_EXPIRED')
  );
};

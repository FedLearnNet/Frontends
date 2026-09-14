import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import Keycloak from 'keycloak-js';
import {catchError, from, Observable, switchMap, throwError} from 'rxjs';
import {notifySessionExpiredAndReauthenticate} from '@shared-lib/services/keycloak-auth.helper';
import {isProtectedApiUrl} from '@shared-lib/services/keycloak';
import {KeycloakSessionService} from '@shared-lib/services/keycloak-session.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {TranslateService} from '@ngx-translate/core';

/**
 * Validates the Keycloak SSO session before protected API calls.
 * JWT access tokens can outlive the server-side SSO session; see KeycloakSessionService.
 */
export function sessionInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const keycloak = inject(Keycloak);
  const sessionService = inject(KeycloakSessionService);
  const injector = inject(Injector);

  if (!isProtectedApiUrl(req.url) || !keycloak.authenticated) {
    return next(req);
  }

  return from(sessionService.ensureValidSession(keycloak)).pipe(
    catchError((error: unknown) => {
      console.warn('[session] Keycloak session validation failed', {url: req.url, error});
      notifySessionExpiredAndReauthenticate(
        keycloak,
        injector.get(ApiErrorSnackbarService),
        injector.get(TranslateService),
      );
      return throwError(() => error);
    }),
    switchMap(() => next(req)),
  );
}

import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import Keycloak from 'keycloak-js';
import {catchError, from, Observable, of, switchMap, throwError} from 'rxjs';
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
      if (keycloak.authenticated) {
        // Keycloak was not reachable, the session itself is fine: send the request with the current token,
        // the next request tries to refresh it again and the backend still rejects an expired one
        console.warn('[session] Could not refresh the Keycloak token', {url: req.url, error});
        return of(undefined);
      }
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

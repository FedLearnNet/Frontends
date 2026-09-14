import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import Keycloak from 'keycloak-js';
import {catchError, Observable, throwError} from 'rxjs';
import {notifySessionExpiredAndReauthenticate} from '@shared-lib/services/keycloak-auth.helper';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {isReauthenticationPending} from '@shared-lib/services/keycloak';
import {TranslateService} from '@ngx-translate/core';

/** Handles 401 responses from the backend (fallback when a stale token was accepted). */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const keycloak = inject(Keycloak);
  // Notification services depend on translation loading, which uses HttpClient.
  // Resolve them only for a 401 to avoid an interceptor/HttpClient DI cycle.
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isReauthenticationPending()) {
        console.warn('[auth] Session expired or unauthorized', {url: req.url});
        notifySessionExpiredAndReauthenticate(
          keycloak,
          injector.get(ApiErrorSnackbarService),
          injector.get(TranslateService),
        );
      }
      return throwError(() => error);
    })
  );
}

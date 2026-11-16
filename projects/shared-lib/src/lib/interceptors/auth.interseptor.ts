import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {BFF_REQUEST_HEADER, BFF_REQUEST_HEADER_VALUE} from '@shared-lib/services/auth.helper';
import {isSameOrigin} from '@shared-lib/utils/url.helper';
import {isLoginPending, login} from '@shared-lib/services/auth';
import {TranslateService} from '@ngx-translate/core';

/** 499 = the BFF session is missing or expired (Quarkus OIDC answer for XHR requests instead of a redirect). */
const SESSION_EXPIRED_STATUSES = [401, 499];

/**
 * Marks same-origin API calls as XHR for the BFF session (no Keycloak redirect, CSRF header)
 * and sends the user to the login when the session expired.
 */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (!isSameOrigin(req.url)) {
    return next(req);
  }

  // Notification services depend on translation loading, which uses HttpClient.
  // Resolve them only for an expired session to avoid an interceptor/HttpClient DI cycle.
  const injector = inject(Injector);
  const request = req.clone({setHeaders: {[BFF_REQUEST_HEADER]: BFF_REQUEST_HEADER_VALUE}});

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (SESSION_EXPIRED_STATUSES.includes(error.status) && !isLoginPending()) {
        console.warn('[auth] Session expired or unauthorized', {url: req.url});
        injector.get(ApiErrorSnackbarService).showSnackBarOnlyText(
          {status: 401},
          injector.get(TranslateService).instant('ERROR.SESSION_EXPIRED')
        );
        login();
      }
      return throwError(() => error);
    })
  );
}

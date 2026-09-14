import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {SpinnerService} from '@shared-lib/services/spinner.service';
import {finalize, Observable} from 'rxjs';

export const SKIP_LOADING = 'X-Skip-Loading'

export function loadingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const spinnerService: SpinnerService = inject(SpinnerService);

  if (req.headers.has(SKIP_LOADING)) {
    // Remove marker and skip spinner
    const headers = req.headers.delete(SKIP_LOADING);
    return next(req.clone({headers}));
  }
  spinnerService.set(true);

  return next(req).pipe(
    finalize(() => {
      spinnerService.set(false);
    })
  );
}

import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SpinnerService } from '@shared-lib/services/spinner.service';
import { finalize } from 'rxjs';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(
      private spinnerService: SpinnerService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    this.spinnerService.set(true);

    return next.handle(request).pipe(
        finalize(() => {
          this.spinnerService.set(false);
        })
    );
  }
}

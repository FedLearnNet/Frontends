import {inject, Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ApiErrorSnackbarService {
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);

  private getMessages(err: HttpErrorResponse): string {
    if (err.message) {
      return err.message;
    }
    return err.statusText;
  }

  private isErrorResponseDTO(val: unknown): val is { status: number; error: string; message: string } {
    if (!val || typeof val !== 'object') {
      return false;
    }
    const v = val as any;
    return typeof v.status === 'number'
      && typeof v.error === 'string'
      && typeof v.message === 'string';
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    const payload = err.error;
    if (this.isErrorResponseDTO(payload) && payload.message?.trim()) {
      return payload.message;
    }
    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      const anyPayload = payload as any;
      const msg = anyPayload.message ?? anyPayload.error_description ?? anyPayload.detail;
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
      try {
        return JSON.stringify(payload);
      } catch {
        // ignore
      }
    }

    return this.getMessages(err);
  }

  public showSnackBarOnlyText(err: any, errorMessage: string, logConsole?: boolean): Observable<never> {

    this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    if (logConsole) {
      console.error(err);
    }
    return throwError(() => err);
  }

  public getErrorMessage(err: HttpErrorResponse, fallback?: string): string {
    let errorMessage: string;

    if ([400, 409].includes(err.status)) {
      errorMessage = this.extractErrorMessage(err);
    } else if (err.status === 401) {
      errorMessage = this.translate.instant('ERROR.SESSION_EXPIRED');
    } else {
      errorMessage = this.extractErrorMessage(err);
    }

    if (!errorMessage) {
      errorMessage = fallback ?? 'An error occurred';
    }
    return errorMessage;
  }

  public showSnackBar(err: HttpErrorResponse, fallback?: string, logConsole?: boolean): Observable<never> {
    const errorMessage: string = this.getErrorMessage(err, fallback);

    this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });

    if (logConsole) {
      console.error(err);
    }
    const thrown = new Error(errorMessage || fallback || 'An error occurred');
    (thrown as any).cause = err;
    return throwError(() => thrown);
  }
}

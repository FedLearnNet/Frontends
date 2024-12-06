import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ApiErrorSnackbarService {
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);


  private getMessages(err: HttpErrorResponse): string {
    if (err.message) {
      return err.message;
    }
    return err.statusText;
  }

  public showSnackBarOnlyText(err: any, errorMessage: string, logConsole?: boolean): Observable<never> {

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    if (logConsole) {
      console.error(err);
    }
    return throwError(() => err);
  }

  public showSnackBar(err: HttpErrorResponse, fallback: string, logConsole?: boolean): Observable<never> {
    let errorMessage: string;
    if (err.status === 400) {
      if (err.error) {
        errorMessage = JSON.stringify(err.error);
      } else {
        errorMessage = this.getMessages(err);
      }
    } else if (err.status === 401) {
      errorMessage = 'Unauthorized, Log in again!';
    } else {
      errorMessage = this.getMessages(err);
    }
    if (!errorMessage) {
      errorMessage = fallback ?? 'An error occurred';
    }
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
    if (logConsole) {
      console.error(err);
    }
    return throwError(() => err);
  }
}

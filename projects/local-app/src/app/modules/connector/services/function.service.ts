import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, Observable, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import { HttpClient } from "@angular/common/http";
import {FunctionsDetailDTO} from "../dto/function";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class FunctionService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);

  private readonly apiUrl = environment.importerApiUrl;
  private readonly path = 'function'


  public getAllFunctionsDetails(): Observable<FunctionsDetailDTO[]> {
    return this.apiService.get<FunctionsDetailDTO[]>(`${this.getBaseUrl()}/detail/`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch functions')),
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

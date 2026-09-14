import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, Observable} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {FunctionsDetailDTO} from "../dto/function";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class FunctionService {
  private translate = inject(TranslateService);

  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'connector/functions';

  public getAllFunctionsDetails(): Observable<FunctionsDetailDTO[]> {
    return this.apiService.get<FunctionsDetailDTO[]>(`${this.getBaseUrl()}/detail`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.FUNCTIONS').toLowerCase()}))),
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

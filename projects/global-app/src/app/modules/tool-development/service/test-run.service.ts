import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, Observable} from "rxjs";
import {environment} from "@global-app/env/environment";
import {TestRunDTO} from "../dto/test-run";
import {TranslateService} from '@ngx-translate/core';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class TestRunService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'runs/test/'


  public getRuns(appId: number): Observable<TestRunDTO[]> {
    return this.apiService.get<TestRunDTO[]>(`${this.getBaseUrl()}${appId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.RUNS').toLowerCase()})))
      );
  }

  /** The test run with the logs and metrics of its attempts. */
  public getRun(appId: number, runId: number): Observable<TestRunDTO> {
    return this.apiService.get<TestRunDTO>(`${this.getBaseUrl()}${appId}/run/${runId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('ERROR.RUNS').toLowerCase()})))
      );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

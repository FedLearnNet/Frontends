import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, Observable, of} from "rxjs";
import {environment} from "@global-app/env/environment";
import {TranslateService} from '@ngx-translate/core';
import {CreateExperimentDetailDTO} from "@shared-lib/modules/app-execution/dto/experiment";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {ExecutionExperimentDTO, TestRunDTO} from "../dto/test-run";

// Experiments are test runs whose step searches a grid of hyper parameters, a trial per attempt.
@Injectable({
  providedIn: 'root'
})
export class ExperimentService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'runs/experiment/'


  public getExperiments(appId: number): Observable<TestRunDTO[]> {
    return this.apiService.get<TestRunDTO[]>(`${this.getBaseUrl()}${appId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.RUNS').toLowerCase()})
        ))
      );
  }

  // Takes over the name, description and charts.
  public updateExperiment(appId: number, experiment: ExecutionExperimentDTO): Observable<ExecutionExperimentDTO> {
    return this.apiService.put<ExecutionExperimentDTO>(`${this.getBaseUrl()}${appId}/experiment/${experiment.id}`, experiment)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.EXPERIMENT').toLowerCase()})
        ))
      );
  }

  public createExperiment(appId: number, experiment: CreateExperimentDetailDTO): Observable<TestRunDTO> {
    return this.apiService.post<TestRunDTO>(`${this.getBaseUrl()}${appId}/experiment`, experiment)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.EXPERIMENT').toLowerCase()})
        ))
      );
  }

  /** The experiment with the logs and metrics of all its trials. */
  public getExperiment(appId: number | string | null, experimentId: number | string | null): Observable<TestRunDTO> {

    if (!appId || !experimentId) {
      return of({} as TestRunDTO);
    }
    return this.apiService.get<TestRunDTO>(`${this.getBaseUrl()}${appId}/experiment/${experimentId}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.EXPERIMENT_DETAIL_DTO').toLowerCase()})
        ))
      );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

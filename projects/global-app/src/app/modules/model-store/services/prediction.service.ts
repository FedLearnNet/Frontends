import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {TranslateService} from '@ngx-translate/core';
import {DataAnalysisPredictionDTO} from "@shared-lib/modules/app-execution/dto/prediction";

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'model'


  public getPredictions(): Observable<DataAnalysisPredictionDTO[]> {
    return this.apiService.get<DataAnalysisPredictionDTO[]>(this.getBaseUrl() + "/predictions")
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ALL_PREDICTIONS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getPredictionsForModel(modelId: number): Observable<DataAnalysisPredictionDTO[]> {
    return this.apiService.get<DataAnalysisPredictionDTO[]>(`${this.getBaseUrl()}/${modelId}/predictions`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.MODELS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public createPrediction(modelId: number, subId: number, input: string): Observable<DataAnalysisPredictionDTO> {
    const prediction = {
      input: input,
      modelSubId: subId
    };
    return this.apiService.post<DataAnalysisPredictionDTO>(`${this.getBaseUrl()}/${modelId}/sub/${subId}/predictions`, prediction)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.MODEL').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

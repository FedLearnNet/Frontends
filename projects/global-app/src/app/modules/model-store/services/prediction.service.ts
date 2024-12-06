import {Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {PredictionDto} from "@global-app/model-store/dto/prediction";

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private readonly apiUrl;
  private readonly path = 'model'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.globalDBApiUrl;
  }

  public getPredictions(): Observable<PredictionDto[]> {
    return this.apiService.get<PredictionDto[]>(this.getBaseUrl() + "/predictions")
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch all predictions';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getPredictionsForModel(modelId: number): Observable<PredictionDto[]> {
    return this.apiService.get<PredictionDto[]>(`${this.getBaseUrl()}/${modelId}/predictions`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch models';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public createPrediction(modelId: number, subId: number, input: string): Observable<PredictionDto> {
    const prediction = {
      input: input,
      modelSubId: subId
    };
    return this.apiService.post<PredictionDto>(`${this.getBaseUrl()}/${modelId}/sub/${subId}/predictions`, prediction)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch model';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

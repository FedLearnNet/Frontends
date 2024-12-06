import {Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, EMPTY, map, Observable, of, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {ModelDetailDto, ModelDto, ModelSubDto, ModelVersionDto} from "@global-app/model-store/dto/model";

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private readonly apiUrl;
  private readonly path = 'model'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.globalDBApiUrl;
  }

  public getModels(): Observable<ModelDto[]> {
    return this.apiService.get<ModelDto[]>(this.getBaseUrl())
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch models';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getSubModelForExperimentRun(runId: number): Observable<ModelSubDto> {
    return this.apiService.get<ModelSubDto>(this.getBaseUrl() + "/experiment/run/" + runId)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch sub model';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getSubModelForExperiment(experimentId: number): Observable<ModelVersionDto> {
    return this.apiService.get<ModelVersionDto>(this.getBaseUrl() + "/experiment/" + experimentId)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch sub model';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public selectSubModel(subModelDto: number): Observable<ModelSubDto> {
    return this.apiService.delete<ModelSubDto>(this.getBaseUrl() + "/" + subModelDto + "/select")
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to select sub model';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getMyModels(appId?: number): Observable<ModelDto[]> {
    let queryParam = new HttpParams();
    if (appId) {
      queryParam = queryParam.set('appId', appId);
    }
    return this.apiService.get<ModelDto[]>(this.getBaseUrl() + "/my", queryParam)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch models';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getModel(id: number): Observable<ModelDetailDto> {
    if (!id) {
      return EMPTY;
    }
    return this.apiService.get<ModelDetailDto>(this.getBaseUrl() + "/" + id)
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

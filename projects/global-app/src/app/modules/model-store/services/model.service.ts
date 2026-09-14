import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, EMPTY, Observable, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {ModelDetailDto, ModelDto, ModelSubDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private apiService: ApiService = inject(ApiService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'model'


  public getModels(): Observable<ModelDto[]> {
    return this.apiService.get<ModelDto[]>(this.getBaseUrl())
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.MODELS').toLowerCase()})
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getSubModelForExperimentRun(runId: number): Observable<ModelSubDto> {
    return this.apiService.get<ModelSubDto>(this.getBaseUrl() + "/experiment/run/" + runId)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.SUB_MODELS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public updateModel(id: number, dto: ModelDto): Observable<ModelDto> {
    return this.apiService.put<ModelDto>(`${this.getBaseUrl()}/${id}`, dto)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.MODEL').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public updateModelVersion(id: number, modelVersionId: number, dto: ModelVersionDto): Observable<ModelVersionDto> {
    return this.apiService.put<ModelVersionDto>(`${this.getBaseUrl()}/${id}/version/${modelVersionId}`, dto)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.MODEL').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }


  public getModelVersionForExperiment(experimentId: number): Observable<ModelVersionDto> {
    return this.apiService.get<ModelVersionDto>(this.getBaseUrl() + "/experiment/" + experimentId)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.SUB_MODELS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getModelVersionForFederatedExperiment(experimentId: number): Observable<ModelVersionDto> {
    return this.apiService.get<ModelVersionDto>(this.getBaseUrl() + "/experiment/federated/" + experimentId)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.SUB_MODELS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public selectSubModel(subModelDto: number): Observable<ModelSubDto> {
    return this.apiService.delete<ModelSubDto>(this.getBaseUrl() + "/" + subModelDto + "/select")
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_SELECT', {name: this.translate.instant('GRID.SUB_MODELS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getMyModels(appId?: number, experimentId?: number, federatedExperimentId?: number): Observable<ModelDto[]> {
    let queryParam = new HttpParams();
    if (appId) {
      queryParam = queryParam.set('appId', appId);
    }
    if (experimentId) {
      queryParam = queryParam.set('experimentId', experimentId);
    }
    if (federatedExperimentId) {
      queryParam = queryParam.set('federatedExperimentId', federatedExperimentId);
    }
    return this.apiService.get<ModelDto[]>(this.getBaseUrl() + "/my", queryParam)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.MODELS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
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
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.MODEL').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }


  public downloadModelSubFile(modelSubFileId: number): Observable<HTMLAnchorElement> {
    return this.apiService.download(`${this.getBaseUrl()}/sub/file/${modelSubFileId}/download`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_DOWNLOAD', {name: this.translate.instant('LABEL.FILE').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public deleteModelSubFile(modelSubFileId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.getBaseUrl()}/sub/file/${modelSubFileId}`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('LABEL.FILE').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

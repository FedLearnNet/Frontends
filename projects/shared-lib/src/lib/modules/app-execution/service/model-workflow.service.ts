import {inject, Injectable} from "@angular/core";
import {catchError, Observable, throwError} from "rxjs";
import {ApiService} from "@shared-lib/services/api.service";
import {environment} from "@global-app/env/environment";
import {
  CreateModelWorkflowDTO,
  ModelWorkflowDetailDTO,
  ModelWorkflowDTO
} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {DataAnalysisWorkflowRunDTO} from "@shared-lib/modules/app-execution/dto/data-analysis-workflow";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";
import {HttpHeaders} from "@angular/common/http";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";


@Injectable({
  providedIn: 'root'
})
export class ModelWorkflowService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'model/workflow'


  list(): Observable<ModelWorkflowDTO[]> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.apiService.get<ModelWorkflowDTO[]>(this.getBaseUrl(), undefined, headers);
  }

  retrieve(id: number): Observable<ModelWorkflowDetailDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.get<ModelWorkflowDetailDTO>(`${this.getBaseUrl()}/${id}`, undefined, headers);
  }

  generateAndDownloadReport(id: number): Observable<HTMLAnchorElement> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.download(`${this.getBaseUrl()}/${id}/report`, undefined, headers).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ALL_PREDICTIONS').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }


  delete(id: number): Observable<void> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.delete<void>(`${this.getBaseUrl()}/${id}`, headers);
  }

  create(workflow: CreateModelWorkflowDTO): Observable<ModelWorkflowDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.post<ModelWorkflowDTO>(this.getBaseUrl(), workflow, headers);
  }

  retrieveWorkflowExperiment(id: number, experimentId: number): Observable<DataAnalysisWorkflowRunDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.get<DataAnalysisWorkflowRunDTO>(`${this.getBaseUrl()}/${id}/experiment/${experimentId}`,
      undefined, headers);
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

}

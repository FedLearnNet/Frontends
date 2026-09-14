import {inject, Injectable} from "@angular/core";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest} from "@angular/common/http";
import {catchError, map, Observable, throwError} from "rxjs";
import {ApiService} from "@shared-lib/services/api.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "@global-app/env/environment";
import {ModelWorkflowUploadFileResponse} from "@shared-lib/modules/app-execution/model/model-workflow-file";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";


@Injectable({
  providedIn: 'root'
})
export class ModelWorkflowFileManagementService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.globalLearningApiUrl
  private readonly path = 'model/workflow'

  public listFiles(workflowId: number): Observable<DataAnalysisFileDTO[]> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');

    return this.apiService.get<DataAnalysisFileDTO[]>(this.getBaseUrl(workflowId), undefined, headers)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.ALL_PREDICTIONS').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  deleteFile(workflowId: number, id: number): Observable<void> {
    return this.apiService.delete(`${this.getBaseUrl(workflowId)}/${id}`)
  }

  linkFile(workflowId: number, id: number): Observable<DataAnalysisFileDTO> {
    return this.apiService.post<DataAnalysisFileDTO>(`${this.getBaseUrl(workflowId)}/${id}/link`, {})
  }

  upload(workflowId: number, file: File): Observable<ModelWorkflowUploadFileResponse> {
    if (!(file instanceof File)) {
      return throwError(() => new Error('Invalid file type. Expected File object.'));
    }

    const form = new FormData();
    form.append('file', file, file.name);

    const req = new HttpRequest('POST', `${this.getBaseUrl(workflowId)}/upload`, form, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * (event.loaded || 0)) / (event.total || 1));
          return {
            progress,
            inProgress: true,
          } as ModelWorkflowUploadFileResponse
        }
        if (event.type === HttpEventType.Response) {
          const uploaded: DataAnalysisFileDTO = event.body;
          return {
            progress: 100,
            result: uploaded,
            inProgress: false,
          } as ModelWorkflowUploadFileResponse

        }
        return {
          progress: 0,
          inProgress: true,
        } as ModelWorkflowUploadFileResponse
      })
    );
  }

  private getBaseUrl(workflowId: number): string {
    return `${this.apiUrl}/${this.path}/${workflowId}/files`;
  }
}


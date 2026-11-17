import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, map, Observable, takeWhile, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {
  CreateProjectLocalExperimentDTO,
  ProjectFederatedCreateExperimentDTO,
  ProjectRunDTO,
  ProjectRunKind
} from "@global-app/project/dto/project-experiments";
import {TranslateService} from '@ngx-translate/core';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {SseClient} from "ngx-sse-client";
import {HttpHeaders} from "@angular/common/http";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";

/** Trainings of a project, on the platform or across clinics, and tests of its workflow; each a run. */
@Injectable({
  providedIn: 'root'
})
export class ProjectExperimentService {
  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'project'
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly sseClient: SseClient = inject(SseClient);

  public list(projectId: number, kind: ProjectRunKind): Observable<ProjectRunDTO[]> {
    return this.withError(this.apiService.get<ProjectRunDTO[]>(`${this.getBaseUrl(projectId)}/${kind}`), 'ERROR.FAILED_TO_FETCH', 'GRID.PROJECTS');
  }

  public create(projectId: number, kind: ProjectRunKind,
                dto: CreateProjectLocalExperimentDTO | ProjectFederatedCreateExperimentDTO): Observable<ProjectRunDTO> {
    return this.withError(this.apiService.post<ProjectRunDTO>(`${this.getBaseUrl(projectId)}/${kind}`, dto), 'ERROR.FAILED_TO_CREATE', 'GRID.PROJECT');
  }

  public start(projectId: number, kind: ProjectRunKind, runId: number): Observable<ProjectRunDTO> {
    return this.withError(this.apiService.putEmpty<ProjectRunDTO>(`${this.getBaseUrl(projectId)}/${kind}/${runId}/start`), 'ERROR.FAILED_TO_RUN', 'GRID.PROJECT');
  }

  public stop(projectId: number, kind: ProjectRunKind, runId: number): Observable<ProjectRunDTO> {
    return this.withError(this.apiService.putEmpty<ProjectRunDTO>(`${this.getBaseUrl(projectId)}/${kind}/${runId}/stop`), 'ERROR.FAILED_TO_STOP', 'GRID.PROJECT');
  }

  /** A training on the platform with the logs and metrics of its steps. */
  public detail(projectId: number, runId: number): Observable<ProjectRunDTO> {
    return this.withError(this.apiService.get<ProjectRunDTO>(`${this.getBaseUrl(projectId)}/local/${runId}/detail`), 'ERROR.FAILED_TO_FETCH', 'GRID.LOCAL_STEP_DETAIL_UPDATES');
  }

  /** Tests the project's workflow on dummy data, replacing the test before. */
  public createTest(projectId: number): Observable<ProjectRunDTO> {
    return this.withError(this.apiService.postEmpty<ProjectRunDTO>(`${this.getBaseUrl(projectId)}/local/test`), 'ERROR.FAILED_TO_CREATE', 'GRID.PROJECT');
  }

  /** The run now and on every change after, until it ended. */
  public follow(projectId: number, kind: ProjectRunKind, runId: number): Observable<ProjectRunDTO> {
    return this.stream(`${this.getBaseUrl(projectId)}/${kind}/${runId}`);
  }

  public followTest(projectId: number): Observable<ProjectRunDTO> {
    return this.stream(`${this.getBaseUrl(projectId)}/local/test`);
  }

  private stream(url: string): Observable<ProjectRunDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.sseClient.stream(url, {keepAlive: true, responseType: 'event'}, {headers}, 'GET').pipe(
      map(event => {
        if (event.type === 'error') {
          const errorEvent = event as ErrorEvent;
          console.error(errorEvent.error, errorEvent.message);
          throw new Error('SSE connection error');
        }
        return JSON.parse((event as MessageEvent).data) as ProjectRunDTO;
      }),
      takeWhile(run => !isFinalStatus(run.status), true)
    );
  }

  private withError<T>(request: Observable<T>, errorKey: string, nameKey: string): Observable<T> {
    return request.pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant(errorKey, {name: this.translate.instant(nameKey).toLowerCase()});
        this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
        return throwError(() => err);
      })
    );
  }

  private getBaseUrl(projectId: number): string {
    return `${this.apiUrl}/${this.path}/${projectId}/experiment`;
  }
}

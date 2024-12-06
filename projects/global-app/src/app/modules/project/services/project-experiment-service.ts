import {Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, map, Observable, of, throwError} from "rxjs";
import {
  configToConnectorConfigDTO,
  ConnectorConfig,
  ConnectorConfigDTO
} from "../../../../../../local-app/src/app/modules/connector/models/connector-config";
import {ProjectDetailDto, ProjectDto} from "../dto/project";
import {TokenDto} from "../dto/token";
import {SiteDto} from "../dto/site";
import {environment} from "@global-app/env/environment";
import {
  ProjectFederatedCreateExperimentDTO,
  ProjectFederatedExperimentDTO, ProjectLocalCreateExperimentDTO, ProjectLocalExperimentDTO
} from "@global-app/project/dto/project-experiments";

@Injectable({
  providedIn: 'root'
})
export class ProjectExperimentService {
  private readonly apiUrl;
  private readonly path = 'project'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.globalDBApiUrl;
  }


  public getProjectFederatedExperiments(projectId: number): Observable<ProjectFederatedExperimentDTO[]> {
    return this.apiService.get<ProjectFederatedExperimentDTO[]>(`${this.getBaseUrl(projectId)}/federated`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch projects';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public createFederatedExperiment(projectId: number, experiment: ProjectFederatedCreateExperimentDTO): Observable<ProjectFederatedExperimentDTO> {
    return this.apiService.post<ProjectFederatedExperimentDTO>(`${this.getBaseUrl(projectId)}/federated`, experiment)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to create project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }


  public getLocalFederatedExperiments(projectId: number): Observable<ProjectLocalExperimentDTO[]> {
    return this.apiService.get<ProjectLocalExperimentDTO[]>(`${this.getBaseUrl(projectId)}/local`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch projects';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public createLocalExperiment(projectId: number, experiment: ProjectLocalCreateExperimentDTO): Observable<ProjectLocalExperimentDTO> {
    return this.apiService.post<ProjectLocalExperimentDTO>(`${this.getBaseUrl(projectId)}/local`, experiment)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to create project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }
  private getBaseUrl(projectId: number): string {
    return `${this.apiUrl}/${this.path}/${projectId}/experiment`;
  }

}

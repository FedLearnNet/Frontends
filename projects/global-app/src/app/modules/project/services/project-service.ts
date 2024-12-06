import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, map, Observable, of, throwError} from "rxjs";
import {
  configToConnectorConfigDTO,
  ConnectorConfig,
  ConnectorConfigDTO
} from "../../../../../../local-app/src/app/modules/connector/models/connector-config";
import {ProjectCreateDto, ProjectDetailDto, ProjectDto} from "../dto/project";
import {TokenDto} from "../dto/token";
import {SiteDto} from "../dto/site";
import {environment} from "@global-app/env/environment";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiUrl;
  private readonly path = 'project'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.globalDBApiUrl;
  }

  //start
  public getProjects(): Observable<ProjectDto[]> {
    return this.apiService.get<ProjectDto[]>(this.getBaseUrl())
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch projects')),
      );
  }

  public getProject(id: number | string | null): Observable<ProjectDetailDto> {
    if (!id) {
      return throwError(() => 'No id provided');
    }
    return this.apiService.get<ProjectDetailDto>(`${this.getBaseUrl()}/${id}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch project with id: ' + id)),
      );
  }

  public createProject(project: ProjectCreateDto): Observable<ProjectDetailDto> {
    return this.apiService.post<ProjectDetailDto>(this.getBaseUrl(), project)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to create project')),
      );
  }

  public updateProject(project: ProjectDetailDto): Observable<ProjectDetailDto> {
    return this.apiService.put<ProjectDetailDto>(`${this.getBaseUrl()}/${project.id}`, project)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to update project with id: ' + project.id))
      );
  }

  public deleteProject(id: number): Observable<boolean> {
    return this.apiService.delete<Response>(`${this.getBaseUrl()}/${id}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to delete project with id: ' + id)),
        map(() => true)
      );
  }

  public getTokens(id: number): Observable<TokenDto[]> {
    return this.apiService.get<TokenDto[]>(`/project-tokens/${id}/`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to update project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public createToken(projectId: number): Observable<boolean> {
    return this.apiService.post<Response>(`/project-tokens/${projectId}/`, {cmd: 'create'})
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to update project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return of(false)
        }),
        map(() => true)
      );
  }

  public deleteToken(tokenId: number): Observable<boolean> {
    return this.apiService.delete<Response>(`/project-tokens/token/${tokenId}/`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to update project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return of(false)
        }),
        map(() => true)
      );
  }

  public joinProject(token: string): Observable<boolean> {
    return this.apiService.post<Response>('/project-tokens/', {token, cmd: 'join'})
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to update project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return of(false)
        }),
        map(() => true)
      );
  }

  public declineProject(token: TokenDto): Observable<boolean> {
    return this.apiService.post<Response>('/project-tokens/', {...token, cmd: 'decline'})
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to update project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return of(false)
        }),
        map(() => true)
      );
  }

  public getTokenUsedFlag(id: number): Observable<boolean> {
    return this.apiService.get<Response>(`/project-tokens/${id.toString()}/`)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to update project';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return of(false)
        }),
        map(() => true)
      );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {catchError, map, Observable, throwError} from "rxjs";
import {ProjectCreateDto, ProjectDetailDto, ProjectDto} from "../dto/project";
import {environment} from "@global-app/env/environment";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';
import {HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse} from "@angular/common/http";
import {UploadProgress} from "@shared-lib/modules/files/model/file-response";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly http: HttpClient = inject(HttpClient);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'project'

  //start
  public getProjects(): Observable<ProjectDto[]> {
    return this.apiService.get<ProjectDto[]>(this.getBaseUrl())
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()}))),
      );
  }

  public getProject(id: number | string | null): Observable<ProjectDetailDto> {
    if (!id) {
      return throwError(() => 'No id provided');
    }
    return this.apiService.get<ProjectDetailDto>(`${this.getBaseUrl()}/${id}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECT_WITH_ID', {id: id}).toLowerCase()}))),
      );
  }

  public createProject(project: ProjectCreateDto): Observable<ProjectDetailDto> {
    return this.apiService.post<ProjectDetailDto>(this.getBaseUrl(), project)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.PROJECT').toLowerCase()}))),
      );
  }

  public updateProject(project: ProjectDetailDto): Observable<ProjectDetailDto> {
    return this.apiService.put<ProjectDetailDto>(`${this.getBaseUrl()}/${project.id}`, project)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.PROJECT_WITH_ID', {id: project.id}).toLowerCase()})))
      );
  }

  public deleteProject(id: number): Observable<boolean> {
    return this.apiService.delete<Response>(`${this.getBaseUrl()}/${id}`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('GRID.PROJECT_WITH_ID', {id: id}).toLowerCase()}))),
        map(() => true)
      );
  }

  upload(id: number, file: File): Observable<UploadProgress<ProjectDetailDto>> {
    if (!(file instanceof File)) {
      return throwError(() => new Error('Invalid file type. Expected File object.'));
    }
    const form = new FormData();
    form.append('file', file, file.name);
    const req = new HttpRequest('POST', `${this.getBaseUrl()}/${id}/files/upload`, form, {reportProgress: true});
    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? file.size;
          const loaded = event.loaded ?? 0;
          const progress = total > 0 ? Math.round((100 * loaded) / total) : 0;
          return {progress, inProgress: true, loaded, total} as UploadProgress<ProjectDetailDto>;
        }
        if (event.type === HttpEventType.Response) {
          const uploaded: ProjectDetailDto = (event as HttpResponse<ProjectDetailDto>).body as ProjectDetailDto;
          return {progress: 100, inProgress: false, loaded: file.size, total: file.size, result: uploaded} as UploadProgress<ProjectDetailDto>;
        }
        return {progress: 0, inProgress: true, loaded: 0, total: file.size} as UploadProgress<ProjectDetailDto>;
      }),
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_UPLOAD', {name: this.translate.instant('LABEL.FILE').toLowerCase()});
        this.errorSnackbarService.showSnackBar(errorMessage, this.translate.instant('BUTTON.CLOSE'));
        return throwError(() => err);
      })
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

import {inject, Injectable} from '@angular/core';
import {map, Observable, throwError} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {environment as e2} from '@global-app/env/environment';
import {catchError} from 'rxjs/operators';
import {WorkflowCreateDTO, WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {environment as e1} from "@local-app/env/environment";
import {UrlDTO} from "@shared-lib/modules/store/dto/app";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({providedIn: 'root'})
export class WorkflowService {
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly apiErrorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;

  private readonly path = 'workflow';

  private baseUrl(): string {
    if (this.localApiURL) {
      return `${this.localApiURL}/${this.path}`;
    }
    return `${this.globalApiURL}/${this.path}`;
  }


  listWorkflows(): Observable<WorkflowDTO[]> {
    return this.api.get<WorkflowDTO[]>(`${this.baseUrl()}`).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_RETRIEVE', {
            name: this.translate.instant('LABEL.WORKFLOW').toLowerCase(),
          });
        this.snackBar.open(
          errorMessage,
          this.translate.instant('BUTTON.CLOSE'),
          {duration: 5000},
        );
        return throwError(() => err);
      })
    );
  }

  listWorkflowForApp(appId: number): Observable<WorkflowDTO[]> {
    return this.api.get<WorkflowDTO[]>(`${this.baseUrl()}/list/app/${appId}`).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_RETRIEVE', {
            name: this.translate.instant('LABEL.WORKFLOW').toLowerCase(),
          });
        this.snackBar.open(
          errorMessage,
          this.translate.instant('BUTTON.CLOSE'),
          {duration: 5000},
        );
        return throwError(() => err);
      })
    );
  }

  retrieve(id: number): Observable<WorkflowDTO> {
    return this.api.get<WorkflowDTO>(`${this.baseUrl()}/${id}`).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  create(createDTO: WorkflowCreateDTO): Observable<WorkflowDTO> {
    return this.api.post<WorkflowDTO>(this.baseUrl(), createDTO).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('LABEL.WORKFLOW').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  createNextEmpty(): Observable<WorkflowDTO> {
    return this.api.post<WorkflowDTO>(this.baseUrl() + "/new", {}).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('LABEL.WORKFLOW').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }


  update(id: number, updateDTO: WorkflowDTO): Observable<WorkflowDTO> {
    return this.api.put<WorkflowDTO>(`${this.baseUrl()}/${id}`, updateDTO).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('LABEL.WORKFLOW').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.baseUrl()}/${id}`).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('LABEL.WORKFLOW').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  public exportWorkflowAsJson(workflowId: number): Observable<string> {
    return this.api.post<UrlDTO>(`${this.baseUrl()}/${workflowId}/export`, {})
      .pipe(
        map(url => url.url),
        catchError((err) => this.apiErrorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_EXPORT', {name: this.translate.instant('GRID.APP').toLowerCase()})))
      );
  }
}

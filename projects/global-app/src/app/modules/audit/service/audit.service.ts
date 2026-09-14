import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "@global-app/env/environment";
import {Observable} from "rxjs";
import {catchError} from "rxjs/operators";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ToolAuditCombinationDTO, ToolAuditCreateDTO, ToolAuditDTO, ToolAuditPendingDTO} from "../dto/audit";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({providedIn: 'root'})
export class AuditService {
  private readonly api = inject(ApiService);
  private readonly translate = inject(TranslateService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);

  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'apps/audit'
  private readonly headers = new HttpHeaders().set(SKIP_LOADING, 'true');

  list(toolId?: number, actorId?: string): Observable<ToolAuditDTO[]> {

    let params = new HttpParams();
    if (toolId != null) {
      params = params.set("toolId", toolId);
    }
    if (actorId) {
      params = params.set("actorId", actorId);
    }

    return this.api.get<ToolAuditDTO[]>(this.baseUrl(), params, this.headers).pipe(
      catchError(err => this.fail(err, 'LABEL.AUDIT'))
    );
  }

  listPending(): Observable<ToolAuditPendingDTO[]> {
    return this.api.get<ToolAuditPendingDTO[]>(`${this.baseUrl()}/pending`, undefined, this.headers).pipe(
      catchError(err => this.fail(err, 'LABEL.AUDIT'))
    );
  }

  get(id: number): Observable<ToolAuditDTO> {
    return this.api.get<ToolAuditDTO>(`${this.baseUrl()}/${id}`, undefined, this.headers).pipe(
      catchError(err => this.fail(err, 'LABEL.AUDIT'))
    );
  }

  getByVersion(id: number): Observable<ToolAuditCombinationDTO> {
    return this.api.get<ToolAuditCombinationDTO>(`${this.baseUrl()}/tool-version/${id}`, undefined, this.headers).pipe(
      catchError(err => this.fail(err, 'LABEL.AUDIT'))
    );
  }


  create(dto: ToolAuditCreateDTO): Observable<ToolAuditDTO> {
    return this.api.post<ToolAuditDTO>(this.baseUrl(), dto, this.headers).pipe(
      catchError(err => this.fail(err, 'LABEL.AUDIT'))
    );
  }

  update(id: number, dto: ToolAuditDTO): Observable<ToolAuditDTO> {
    return this.api.put<ToolAuditDTO>(`${this.baseUrl()}/${id}`, dto, this.headers).pipe(
      catchError(err => this.fail(err, 'LABEL.AUDIT'))
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.baseUrl()}/${id}`, this.headers).pipe(
      catchError(err => this.fail(err, 'LABEL.AUDIT'))
    );
  }

  private baseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  private fail(err: any, labelKey: string) {
    return this.errorSnackbarService.showSnackBar(err,
      this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant(labelKey).toLowerCase()}));
  }
}

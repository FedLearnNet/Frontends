import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {RunType} from "../dto/socket";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.globalLearningApiUrl
  private readonly path = 'testembed'

  public downloadZIP(appId: number, runId: number, runType: RunType): Observable<ArrayBuffer> {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('runType', runType.toString())
    return this.http.get(`${this.getBaseUrl()}/${appId}/upload/output/${runId}`, {
      params: queryParam,
      responseType: 'arraybuffer'
    }).pipe(
      tap(data => {
        const blob = new Blob([data], {type: 'application/zip'});
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      }),

      catchError(err => {
        const errorMessage = this.translate.instant('ERROR.FAILED_TO_DOWNLOAD', {name: this.translate.instant('GRID.ZIP').toLowerCase()});
        this.errorSnackbarService.showSnackBar(err, errorMessage);
        return throwError(() => err);
      })
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

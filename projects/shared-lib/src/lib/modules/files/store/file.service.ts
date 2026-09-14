import {inject, Injectable} from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {catchError, map} from 'rxjs/operators';
import {
  FileContentDTO,
  FileDTO,
  FileProfile,
  FileRenameDTO,
  UploadFileProgress
} from "@shared-lib/modules/files/dto/file";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";

@Injectable({providedIn: 'root'})
export class FileService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;

  private readonly path = 'files';

  private baseUrl(): string {
    if (this.localApiURL) {
      return `${this.localApiURL}/${this.path}`;
    }
    return `${this.globalApiURL}/${this.path}`;
  }

  listFiles(): Observable<FileDTO[]> {
    return this.api.get<FileDTO[]>(this.baseUrl()).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.FILES').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  getFile(id: number, secret?: string | null): Observable<FileDTO> {
    const params = this.withSecret(new HttpParams(), secret);
    return this.api.get<FileDTO>(`${this.baseUrl()}/${id}`, params).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.FILE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  getFileContent(id: number, secret?: string | null, showError?: boolean): Observable<FileContentDTO> {
    const params = this.withSecret(new HttpParams(), secret);
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.api.get<FileContentDTO>(`${this.baseUrl()}/${id}/content`, params, headers).pipe(
      catchError((err) => {
        if (showError) {
          const errorMessage =
            JSON.stringify(err?.error) ||
            this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.FILE_CONTENT').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        }
        return throwError(() => err);
      })
    );
  }

  getFileProfile(id: number, secret?: string | null): Observable<FileProfile> {
    const params = this.withSecret(new HttpParams(), secret);
    return this.api.get<FileProfile>(`${this.baseUrl()}/${id}/statistics`, params).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.FILE_PROFILE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  deleteFile(id: number, secret?: string | null): Observable<void> {
    const params = this.withSecret(new HttpParams(), secret);
    return this.api.delete<void>(`${this.baseUrl()}/${id}`, undefined, params).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('LABEL.FILE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  renameFile(id: number, newName: string, secret?: string | null): Observable<FileDTO> {
    const params = this.withSecret(new HttpParams(), secret);
    const body: FileRenameDTO = {fileName: newName};
    return this.api.put<FileDTO>(`${this.baseUrl()}/${id}/rename`, body, undefined, params).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('LABEL.FILE_NAME').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  upload(file: File): Observable<UploadFileProgress> {
    if (!(file instanceof File)) {
      return throwError(() => new Error('Invalid file type. Expected File object.'));
    }
    const form = new FormData();
    form.append('file', file, file.name);

    const req = new HttpRequest('POST', this.baseUrl() + "/upload", form, {reportProgress: true});
    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round((100 * (event.loaded || 0)) / Math.max(1, event.total || 1));
          return {progress, inProgress: true} as UploadFileProgress;
        }
        if (event.type === HttpEventType.Response) {
          const uploaded: FileDTO = (event as HttpResponse<FileDTO>).body as FileDTO;
          return {progress: 100, inProgress: false, result: uploaded} as UploadFileProgress;
        }
        return {progress: 0, inProgress: true} as UploadFileProgress;
      }),
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_UPLOAD', {name: this.translate.instant('LABEL.FILE').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  downloadFile(id: number, secret?: string | null): Observable<HTMLAnchorElement> {
    const params = this.withSecret(new HttpParams(), secret);
    return this.api.download(`${this.baseUrl()}/${id}/download`, params)
      .pipe(
        catchError((err) => {
          const errorMessage =
            JSON.stringify(err?.error) ||
            this.translate.instant('ERROR.FAILED_TO_DOWNLOAD', {name: this.translate.instant('LABEL.FILE').toLowerCase()});
          this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  private withSecret(params: HttpParams, secret?: string | null): HttpParams {
    return secret ? params.set('secret', secret) : params;
  }
}

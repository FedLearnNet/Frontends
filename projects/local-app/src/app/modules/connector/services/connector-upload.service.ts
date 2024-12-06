import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {HttpClient, HttpEventType, HttpParams, HttpResponse} from "@angular/common/http";
import {ReUploadInfo, UploadInfoDTO} from "../dto/upload-info";
import {FileUploadSettings} from "../models/input-config";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class ConnectorUploadService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly http: HttpClient = inject(HttpClient);

  private readonly apiUrl = environment.importerApiUrl;
  private readonly path = 'upload'


  uploadFile(file?: File, fileName?: string): Observable<string> {
    if (!file) {
      const err = new Error('No file provided',);
      return throwError(() => err)
    }

    if (fileName === undefined) {
      fileName = file.name;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);

    return this.apiService.post<Response>(`${this.getBaseUrl()}`, formData).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to fetch projects')),
      map(() => {
        return `${this.apiUrl}/files/${fileName}`;
      }),
    );
  }

  reUploadFile(connectorId: number, file?: File, fileName?: string): Observable<ReUploadInfo> {
    if (!file) {
      const err = new Error('No file provided',);
      return throwError(() => err)
    }

    if (fileName === undefined) {
      fileName = file.name;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', fileName);

    return this.apiService.post<Response>(`${this.getBaseUrl()}/${connectorId}/`, formData).pipe(
      catchError((error) => {
        if (error.status === 409) {
          return of({
            success: false,
            error: error.error
          } as ReUploadInfo);
        }
        this.errorSnackbarService.showSnackBar(error,
          'Failed to reupload file');
        return throwError(() => error);
      }),
      map((data: Response | ReUploadInfo) => {
        if (data && "error" in data) {
          return data as ReUploadInfo;
        }
        return {
          success: true
        } as ReUploadInfo
      }),
    );
  }

  loadSupportFiles(schema_id: string): Observable<string[]> {
    return this.http.get<{ files: string[] }>(`${this.getBaseUrl()}/support/${schema_id}/`).pipe(
      map(response => response.files),
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to load additional files')),
    );
  }

  removeSupportFile(schema_id: string, filename: string): Observable<any> {
    const formData = new FormData();
    formData.append('filename', filename);
    return this.http.delete(`${this.getBaseUrl()}/support/${schema_id}/`, {body: formData}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to remove additional files')),)
  }

  uploadSupportFile(schema_id: string, file: File) {
    if (!file) {
      const err = new Error('No file provided',);
      return throwError(() => err)
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    return this.http.post<Response>(`${this.getBaseUrl()}/support/${schema_id}/`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to upload additional files')),
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          return Math.round(100 * event.loaded / event.total!);
        } else if (event instanceof HttpResponse) {
          return 100;
        }
        return 0;
      }),
    ) // Added closing parenthesis here
  }

  getFileNameWithExtension(url: string): string {
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
    let path = url;

    if (isAbsolute) {
      const urlObj = new URL(url.startsWith('//') ? 'https:' + url : url);
      path = urlObj.pathname;
    }
    return path.substring(path.lastIndexOf('/') + 1);
  }

  getLastPathWithoutExtension(url: string): string {
    const fileNameWithExtension = this.getFileNameWithExtension(url);
    return fileNameWithExtension.split('.').slice(0, -1).join('.');
  }

  getFileType(url: string): string {
    const fileNameWithExtension = this.getFileNameWithExtension(url);
    return fileNameWithExtension.split('.').pop() || '';
  }

  getFileInfo(settings: FileUploadSettings): Observable<UploadInfoDTO> {
    const path = this.getLastPathWithoutExtension(settings.filePath!);
    const fileType = this.getFileType(settings.filePath!);
    const params = new HttpParams()
      .set('file_type', fileType)
      .set('delimiter', settings.delimiter);

    return this.http.get<UploadInfoDTO>(`${this.apiUrl}/file/${path}/info/`, {params}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to get file info')),
      map(response => {
        response.data = JSON.parse(response.json);
        return response;
      })
    );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

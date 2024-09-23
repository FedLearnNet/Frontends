import {Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, map, Observable, of, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import { HttpClient, HttpEventType, HttpParams, HttpResponse } from "@angular/common/http";
import {UploadInfoDTO} from "../dto/upload-info";
import {FileUploadSettings} from "../models/input-config";

@Injectable({
  providedIn: 'root'
})
export class ConnectorUploadService {
  private readonly apiUrl;
  private readonly path = 'upload'

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {
    this.apiUrl = environment.importerApiUrl;
  }


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
      map(() => {
        return `${this.apiUrl}/files/${fileName}`;
      }),
    );
  }

  loadSupportFiles(schema_id: string): Observable<string[]> {
    return this.http.get<{ files: string[] }>(`${this.getBaseUrl()}/support/${schema_id}/`).pipe(
      map(response => response.files),
      catchError(() => of([]))
    );
  }

  removeSupportFile(schema_id: string, filename: string): Observable<any> {
    const formData = new FormData();
    formData.append('filename', filename);
    return this.http.delete(`${this.getBaseUrl()}/support/${schema_id}/`, {body: formData});
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

  getLastPathWithoutExtension(url: string): string {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const fileNameWithExtension = path.substring(path.lastIndexOf('/') + 1);
    return fileNameWithExtension.split('.').slice(0, -1).join('.');
  }

  getFileType(url: string): string {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const fileNameWithExtension = path.substring(path.lastIndexOf('/') + 1);
    return fileNameWithExtension.split('.').pop() || '';
  }

  getFileInfo(settings: FileUploadSettings): Observable<UploadInfoDTO> {
    const path = this.getLastPathWithoutExtension(settings.filePath!);
    const fileType = this.getFileType(settings.filePath!);
    const params = new HttpParams()
      .set('file_type', fileType)
      .set('delimiter', settings.delimiter);

    return this.http.get<UploadInfoDTO>(`${this.apiUrl}/file/${path}/info/`, {params}).pipe(
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

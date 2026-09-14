import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, filter, map, Observable, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import {
  ConnectorFilesDetailDTO,
  ConnectorFilesDTO,
  ConnectorFileUploadSettingsDTO,
} from "../dto/upload-info";
import {FileUploadSettings} from "../models/input-config";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from '@ngx-translate/core';
import {UploadProgress} from "@shared-lib/modules/files/model/file-response";
import {ImportStreamMessage} from '../dto/connector-import';
import {ConnectorImportService} from './connector-import.service';

@Injectable({
  providedIn: 'root'
})
export class ConnectorUploadService {
  private translate = inject(TranslateService);

  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly importService: ConnectorImportService = inject(ConnectorImportService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'connectors/files'

  uploadFile(
    cohortId: number,
    file?: File,
    supportFile = false,
    _replaceFiles = false,
    settings?: FileUploadSettings,
  ): Observable<ConnectorFilesDetailDTO> {
    if (!file) {
      const err = new Error(this.translate.instant('ERROR.NO_FILE_PROVIDED'));
      return throwError(() => err);
    }

    return this.importService
      .importStream(cohortId, file, this.toUploadSettings(file, supportFile, settings), undefined,
        crypto.randomUUID())
      .pipe(
        filter((message): message is ImportStreamMessage & {kind: 'event'} =>
          message.kind === 'event' && !!message.event.last),
        map(message => message.event.result?.files?.[0] as ConnectorFilesDetailDTO),
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()}))),
      );
  }

  loadSupportFiles(cohortId: number): Observable<ConnectorFilesDTO[]> {
    return this.apiService.get<ConnectorFilesDTO[]>(`${this.getBaseUrl()}/cohorts/${cohortId}/files`).pipe(
      map(response => response.filter(file => file.isSupportFile)),
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_LOAD', {name: this.translate.instant('GRID.ADDITIONAL_FILES')}))),
    );
  }

  removeSupportFile(cohortId: number, fileId: number): Observable<any> {
    return this.deleteFile(cohortId, fileId).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_REMOVE', {name: this.translate.instant('GRID.ADDITIONAL_FILES').toLowerCase()}))),
    );
  }

  /** The same upload, reporting the transfer for a caller that shows a bar rather than a panel. */
  uploadFileWithProgress(
    cohortId: number,
    file: File,
    supportFile = false,
    _replaceFiles = false,
  ): Observable<UploadProgress<ConnectorFilesDTO>> {
    return this.importService
      .importStream(cohortId, file, this.toUploadSettings(file, supportFile), undefined,
        crypto.randomUUID())
      .pipe(
        filter(message => message.kind === 'upload' || !!message.event.last),
        map(message => message.kind === 'upload'
          ? {
            loaded: message.loaded,
            total: message.total,
            progress: message.percent,
            inProgress: true,
          }
          : {
            loaded: file.size,
            total: file.size,
            progress: 100,
            inProgress: false,
            result: message.event.result?.files?.[0] as ConnectorFilesDTO,
          }),
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_UPLOAD', {name: this.translate.instant('LABEL.FILE').toLowerCase()}))),
      );
  }

  uploadSupportFileWithProgress(
    cohortId: number,
    file: File,
    reupload = false,
  ): Observable<UploadProgress<ConnectorFilesDTO>> {
    return this.uploadFileWithProgress(cohortId, file, true, reupload);
  }



  private toUploadSettings(
    file: File,
    supportFile: boolean,
    settings?: FileUploadSettings,
  ): ConnectorFileUploadSettingsDTO {
    const name = file.name.toLocaleLowerCase();
    const archive = name.endsWith('.zip');
    const detectedType = name.endsWith('.xls') || name.endsWith('.xlsx')
      ? 'EXCEL'
      : name.endsWith('.json') ? 'JSON' : archive ? 'MULTIPLE_CSV_ZIP' : 'CSV';
    const configuredType = settings?.fileType === 'ZIP'
      ? 'MULTIPLE_CSV_ZIP'
      : settings?.fileType;

    return {
      fileType: archive ? 'MULTIPLE_CSV_ZIP' : configuredType ?? detectedType,
      delimiter: settings?.delimiter ?? (name.endsWith('.tsv') || name.endsWith('.tab') ? '\t' : ','),
      customDelimiter: settings?.customDelimiter,
      hasHeader: settings?.hasHeader ?? true,
      firstSheetOnly: archive ? false : settings?.firstSheetOnly ?? true,
      hasSupportFile: settings?.hasSupportFile ?? false,
      deleteUnneededFileAfterSuccess: settings?.deleteUnneededFileAfterSuccess ?? true,
      supportFile,
      previewRows: 10,
    };
  }

  getFiles(cohortId: number): Observable<ConnectorFilesDTO[]> {
    return this.apiService.get<ConnectorFilesDTO[]>(
      `${this.getBaseUrl()}/cohorts/${cohortId}/files`,
    ).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()}))),
    );
  }


  getFileDetail(cohortId: number, fileId: number): Observable<ConnectorFilesDetailDTO> {
    return this.apiService.get<ConnectorFilesDetailDTO>(
      `${this.getBaseUrl()}/cohorts/${cohortId}/files/${fileId}`
    ).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()}))),
    );
  }

  deleteFile(cohortId: number, fileId: number): Observable<any> {
    return this.apiService.delete(`${this.getBaseUrl()}/cohorts/${cohortId}/files/${fileId}`);
  }

  downloadFile(cohortId: number, fileId: number): Observable<HTMLAnchorElement> {
    return this.apiService.download(`${this.getBaseUrl()}/cohorts/${cohortId}/files/${fileId}/download`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()}))),
    );
  }

  getFirstCohortFileInfo(cohortId: number): Observable<ConnectorFilesDetailDTO> {
    return this.apiService.get<ConnectorFilesDetailDTO>(
      `${this.getBaseUrl()}/cohorts/${cohortId}/file`
    ).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PROJECTS').toLowerCase()}))),
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {CreatePermissionDTO, PermissionDTO} from '@local-app/data-review/models';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {ApiService} from "@shared-lib/services/api.service";
import {environment} from "@local-app/env/environment";
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'permissions'

  createPermission(permissionData: CreatePermissionDTO): Observable<PermissionDTO> {
    const url = `${this.getBaseUrl()}`;
    return this.apiService.post<PermissionDTO>(url, permissionData).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('GRID.PERMISSION').toLowerCase() + `: ${permissionData.cohortId}`})))
    );
  }

  updatePermission(permissionData: PermissionDTO): Observable<PermissionDTO> {
    const url = `${this.getBaseUrl()}/${permissionData.id}`;
    return this.apiService.put<PermissionDTO>(url, permissionData).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_UPDATE', {name: this.translate.instant('GRID.PERMISSION').toLowerCase() + `: ${permissionData.id}`})))
    );
  }

  getPermission(id: number): Observable<PermissionDTO> {
    const url = `${this.getBaseUrl()}/${id}`;
    return this.apiService.get<PermissionDTO>(url).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_GET', {name: this.translate.instant('GRID.PERMISSION').toLowerCase() + `: ${id}`})))
    );
  }

  deletePermission(id: number): Observable<void> {
    const url = `${this.getBaseUrl()}/${id}`;
    return this.apiService.delete<void>(url).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('GRID.PERMISSION').toLowerCase() + `: ${id}`})))
    );
  }

  getAllPermissions(): Observable<PermissionDTO[]> {
    const url = `${this.getBaseUrl()}`;
    return this.apiService.get<PermissionDTO[]>(url).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.PERMISSION').toLowerCase()})))
    );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

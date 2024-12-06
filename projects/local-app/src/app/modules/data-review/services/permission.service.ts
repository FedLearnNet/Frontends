import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {Permission} from '@local-app/data-review/models';
import {convertObjectKeysToSnakeCase} from '@shared-lib/utils';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {ApiService} from "@shared-lib/services/api.service";
import {environment} from "@local-app/env/environment";

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = `${environment.clientMetaApiUrl}/client_meta_api`;
  private readonly path = 'permissions/'

  createPermission(permissionData: Permission): Observable<Permission> {
    const url = `${this.getBaseUrl()}`;
    return this.apiService.post<Permission>(url, convertObjectKeysToSnakeCase(permissionData)).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to create permission: ' + permissionData.id))
    );
  }

  updatePermission(permissionData: Permission): Observable<Permission> {
    const url = `${this.getBaseUrl()}${permissionData.id}/`;
    return this.apiService.put<Permission>(url, convertObjectKeysToSnakeCase(permissionData)).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to update permission with id: ' + permissionData.id))
    );
  }

  getPermission(id: string): Observable<Permission> {
    const url = `${this.getBaseUrl()}${id}/`;
    return this.apiService.get<Permission>(url).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to get permission with id: ' + id))
    );
  }

  deletePermission(id: string): Observable<void> {
    const url = `${this.getBaseUrl()}${id}/`;
    return this.apiService.delete<void>(url).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to delete permission with id: ' + id))
    );
  }

  getAllPermissions(): Observable<Permission[]> {
    const url = `${this.getBaseUrl()}`;
    return this.apiService.get<Permission[]>(url).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(err,
        'Failed to fetch permissions'))
    );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

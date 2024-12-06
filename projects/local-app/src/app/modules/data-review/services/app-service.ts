import {PaginatedResponse} from './../../../../../../shared-lib/src/lib/models/paginated-response';
import {inject, Injectable} from '@angular/core';
import {TrainingStatus} from '@local-app/data-review/models';
import {catchError, Observable} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = `${environment.clientMetaApiUrl}/client_meta_api`;
  private readonly path = 'global/apps/'

  getApp(appId: number): Observable<AppDetailDto> {
    return this.apiService.get<AppDetailDto>(`${this.getBaseUrl()}${appId}/`)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          'Failed to fetch app'))
      );
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {environment} from '@local-app/env/environment';
import {NotificationDTO} from '@shared-lib/base/notifications';

@Injectable({providedIn: 'root'})
export class NotificationService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbar: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'notifications';

  list(): Observable<NotificationDTO[]> {
    return this.apiService.get<NotificationDTO[]>(this.getBaseUrl())
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, 'Failed to load notifications')));
  }

  get(id: number): Observable<NotificationDTO> {
    return this.apiService.get<NotificationDTO>(`${this.getBaseUrl()}/${id}`)
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, `Failed to load notification ${id}`)));
  }

  create(dto: Partial<NotificationDTO>): Observable<NotificationDTO> {
    return this.apiService.post<NotificationDTO>(this.getBaseUrl(), dto)
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, 'Failed to create notification')));
  }

  update(id: number, dto: Partial<NotificationDTO>): Observable<NotificationDTO> {
    return this.apiService.put<NotificationDTO>(`${this.getBaseUrl()}/${id}`, dto)
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, `Failed to update notification ${id}`)));
  }

  markAsRead(id: number): Observable<NotificationDTO> {
    return this.apiService.post<NotificationDTO>(`${this.getBaseUrl()}/${id}/read`, {})
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, `Failed to mark notification ${id} as read`)));
  }

  archive(id: number): Observable<NotificationDTO> {
    return this.apiService.post<NotificationDTO>(`${this.getBaseUrl()}/${id}/archive`, {})
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, `Failed to archive notification ${id}`)));
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.getBaseUrl()}/${id}`)
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, `Failed to delete notification ${id}`)));
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {environment} from '@local-app/env/environment';
import {ApiService} from '@shared-lib/services/api.service';

export interface GlobalAuthLoginDto {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalAuthService {
  private readonly apiService = inject(ApiService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'global/auth';

  login(login: GlobalAuthLoginDto): Observable<void> {
    return this.apiService.post<void>(`${this.baseUrl()}/login`, login);
  }

  clearLogin(): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl()}/login`);
  }

  private baseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

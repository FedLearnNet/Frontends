import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@global-app/env/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiUrl: string;
  private readonly http = inject(HttpClient);

  constructor() {
    // Use one of the available API endpoints from the environment
    this.apiUrl = environment.globalLearningApiUrl || 'http://localhost:8080';
  }

  downloadData(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/data/download`, {
      observe: 'response',
      responseType: 'blob',
      headers: {
        Accept: 'application/octet-stream'
      }
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
      private http: HttpClient,
  ) { }

  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    const options = { params, headers };

    return this.http.get<T>(url, options);
  }

  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    const options = { headers };

    return this.http.post<T>(url, body, options);
  }

  put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    const options = { headers };

    return this.http.put<T>(url, body, options);
  }

  patch<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    const options = { headers };

    return this.http.patch<T>(url, body, options);
  }

  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    const options = { headers };

    return this.http.delete<T>(url, options);
  }

}

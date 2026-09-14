import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {filter} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    const options = {params, headers};

    return this.http.get<T>(url, options);
  }

  download(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<HTMLAnchorElement> {
    const options = {params, headers, responseType: 'blob' as 'json', observe: 'response'};

    return this.http.get<Blob>(url, options as any).pipe(
      filter((event: HttpEvent<Blob>): event is HttpResponse<Blob> => event instanceof HttpResponse),
      map((response: HttpResponse<Blob>) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(new Blob([response.body!], {type: response.body!.type}));

        const contentDisposition = response.headers.get('content-disposition');
        if (!contentDisposition) {
          return downloadLink;
        }
        const match = contentDisposition.match(/filename="?([^"]+)"?/i);
        downloadLink.download = match?.[1] ?? "";
        return downloadLink;
      })
    );
  }

  downloadPost(url: string, params?: HttpParams, headers?: HttpHeaders, body?: any): Observable<HTMLAnchorElement> {
    const options = {params, headers, responseType: 'blob', observe: 'response'};

    return this.http.post<Blob>(url, body, options as any).pipe(
      filter((event: HttpEvent<Blob>): event is HttpResponse<Blob> => event instanceof HttpResponse),
      map((response: HttpResponse<Blob>) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(new Blob([response.body!], {type: response.body!.type}));

        const contentDisposition = response.headers.get('content-disposition');
        if (!contentDisposition) {
          return downloadLink;
        }
        const fileName = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        downloadLink.download = fileName;
        return downloadLink;
      })
    );
  }

  post<T>(url: string, body: any, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
    const options = {params, headers};
    return this.http.post<T>(url, body, options);
  }

  postEmpty<T>(url: string, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
    const options = {params, headers};
    return this.http.post<T>(url, options);
  }


  put<T>(url: string, body: any, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
    const options = {params, headers};

    return this.http.put<T>(url, body, options);
  }

  putEmpty<T>(url: string, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
    const options = {params, headers};
    return this.http.put<T>(url, options);
  }

  patch<T>(url: string, body: any, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
    const options = {params, headers};

    return this.http.patch<T>(url, body, options);
  }

  delete<T>(url: string, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
    const options = {params, headers};
    return this.http.delete<T>(url, options);
  }

  deleteWithBody<T>(url: string, body: any, headers?: HttpHeaders, params?: HttpParams): Observable<T> {
    return this.http.delete<T>(url, {body, params, headers});
  }

}

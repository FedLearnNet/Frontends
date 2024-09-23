import {Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {catchError, Observable, throwError} from 'rxjs';
import {environment} from '@local-app/env/environment';
import { HttpClient } from "@angular/common/http";
import {FunctionsDetailDTO} from "../dto/function";

@Injectable({
  providedIn: 'root'
})
export class FunctionService {
  private readonly apiUrl;
  private readonly path = 'function'

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {
    this.apiUrl = environment.importerApiUrl;
  }


  public getAllFunctionsDetails(): Observable<FunctionsDetailDTO[]> {
    return this.apiService.get<FunctionsDetailDTO[]>(`${this.getBaseUrl()}/detail/`).pipe(
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

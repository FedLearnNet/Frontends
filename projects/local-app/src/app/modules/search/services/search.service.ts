import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '@local-app/env/environment';
import {SearchResultDTO} from '../dto/search-result';

@Injectable({providedIn: 'root'})
export class SearchService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbar: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'search';

  search(query: string, limit?: number): Observable<SearchResultDTO[]> {
    let params = new HttpParams().set('q', query);
    if (limit != null) {
      params = params.set('limit', limit);
    }
    return this.apiService.get<SearchResultDTO[]>(this.getBaseUrl(), params).pipe(
      catchError(err => this.errorSnackbar.showSnackBar(err, this.translate.instant('SEARCH.FAILED')))
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {environment as e2} from '@global-app/env/environment';
import {environment as e1} from '@local-app/env/environment';
import {StoreRatingCreateDTO, StoreRatingDTO} from "@shared-lib/modules/store/dto/store.rating";

@Injectable({providedIn: 'root'})
export class StoreRatingsService {
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  private readonly globalApiURL = e2.globalLearningApiUrl;
  private readonly localApiURL = e1.localLearningAPIURL;
  private readonly path = 'store/ratings';

  private baseUrl(): string {
    if (this.localApiURL) return `${this.localApiURL}/${this.path}`;
    return `${this.globalApiURL}/${this.path}`;
  }

  listForApp(appId: number): Observable<StoreRatingDTO[]> {
    return this.http.get<StoreRatingDTO[]>(`${this.baseUrl()}/app/${appId}`).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.RATINGS').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  listForModel(modelId: number): Observable<StoreRatingDTO[]> {
    return this.http.get<StoreRatingDTO[]>(`${this.baseUrl()}/model/${modelId}`).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('LABEL.RATINGS').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  createForApp(appId: number, dto: StoreRatingCreateDTO): Observable<StoreRatingDTO> {
    return this.http.post<StoreRatingDTO>(`${this.baseUrl()}/app/${appId}`, dto).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('LABEL.RATING').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }

  createForModel(modelId: number, dto: StoreRatingCreateDTO): Observable<StoreRatingDTO> {
    return this.http.post<StoreRatingDTO>(`${this.baseUrl()}/model/${modelId}`, dto).pipe(
      catchError((err) => {
        const errorMessage =
          JSON.stringify(err?.error) ||
          this.translate.instant('ERROR.FAILED_TO_CREATE', {name: this.translate.instant('LABEL.RATING').toLowerCase()});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      })
    );
  }
}

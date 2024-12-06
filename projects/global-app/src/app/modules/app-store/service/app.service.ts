import {Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, EMPTY, map, Observable, of, throwError} from "rxjs";
import {environment} from "@global-app/env/environment";
import {AppDto, AppRatingDto} from "../dto/app";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ConfigPydanticDTO} from "../../test-app/dto/config";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private readonly apiUrl;
  private readonly path = 'apps'

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.apiUrl = environment.globalDBApiUrl;
  }

  public getApps(): Observable<AppDto[]> {
    return this.apiService.get<AppDto[]>(this.getBaseUrl())
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch apps';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getMyApps(): Observable<AppDetailDto[]> {
    return this.apiService.get<AppDetailDto[]>(this.getBaseUrl() + "/my")
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch apps';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getApp(idOrSlug: number | string | null): Observable<AppDetailDto> {
    if (!idOrSlug) {
      return EMPTY;
    }
    return this.apiService.get<AppDetailDto>(this.getBaseUrl() + "/" + idOrSlug)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch app';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getMyApp(id: number | string | null): Observable<AppDetailDto> {
    if (!id) {
      return EMPTY;
    }
    return this.apiService.get<AppDetailDto>(this.getBaseUrl() + "/my/" + id)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch app';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public publishApp(appId: number, changelog: string): Observable<AppDetailDto> {
    return this.apiService.post<AppDetailDto>(this.getBaseUrl() + "/" + appId + "/publish", {
      changelog: changelog
    })
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.message) || 'Failed to publish app';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public getAppPydantic(id?: number, versionId?: number): Observable<ConfigPydanticDTO> {
    if (!id || !versionId) {
      return EMPTY;
    }
    return this.apiService.get<ConfigPydanticDTO>(this.getBaseUrl() + "/" + id + "/pydantic/"+versionId)
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to fetch app pydantic';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  public addRating(appId: number, rating: number, reviewText: string): Observable<AppRatingDto> {
    return this.apiService.post<AppRatingDto>(this.apiUrl + "/ratings/" + appId, {
      rating: rating,
      reviewText: reviewText
    })
      .pipe(
        catchError((err) => {
          const errorMessage = JSON.stringify(err.error) || 'Failed to create new review';
          this.snackBar.open(errorMessage, 'Close', {duration: 5000});
          return throwError(() => err);
        })
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

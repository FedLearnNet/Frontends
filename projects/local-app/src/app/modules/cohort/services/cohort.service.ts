import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, of, Subject, switchMap, takeWhile, throwError, timer} from 'rxjs';
import {HttpErrorResponse, HttpParams} from '@angular/common/http';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@local-app/env/environment';
import {
  CohortAvailableUserDto,
  CohortDeletionPollEvent,
  CohortDetailDto,
  CohortDto,
  CohortMemberCreateDto,
  CohortMemberDto,
  CohortNameHealthDto,
  CreateCohortDto,
} from '@local-app/cohort/models';
import {TranslateService} from "@ngx-translate/core";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";

@Injectable({
  providedIn: 'root'
})
export class CohortService {
  private static readonly DELETION_POLL_INTERVAL_MS = 2500;

  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'cohort'
  private readonly cohortsChangedSubject = new Subject<void>();

  readonly cohortsChanged = this.cohortsChangedSubject.asObservable();

  getCohorts(): Observable<CohortDto[]> {
    return this.apiService.get<CohortDto[]>(`${this.getBaseUrl()}`);
  }

  getCohortById(cohortId: number | string | null | undefined): Observable<CohortDetailDto> {
    if (!cohortId) return of();

    return this.apiService.get<CohortDetailDto>(`${this.getBaseUrl()}/${cohortId}`);
  }

  checkCohortNameHealth(name: string, excludeId?: number | string): Observable<CohortNameHealthDto> {
    let params = new HttpParams().set('name', name);
    if (excludeId != null && excludeId !== '') {
      params = params.set('excludeId', String(excludeId));
    }
    return this.apiService.get<CohortNameHealthDto>(`${this.getBaseUrl()}/health`, params);
  }

  public createCohort(create: CreateCohortDto): Observable<CohortDto> {
    return this.apiService.post<CohortDto>(this.getBaseUrl(), create).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.ERROR_AT', {name: this.translate.instant('GRID.COHORT_CREATION')})
      ))
    );
  }

  updateCohort(cohort: CohortDetailDto): Observable<CohortDetailDto> {
    return this.apiService.put<CohortDetailDto>(`${this.getBaseUrl()}/${cohort.id}`, cohort).pipe(
      catchError((err: HttpErrorResponse) => {
        const fallback = err.status === 409
          ? this.translate.instant('VALIDATION.COHORT_NAME_EXISTS')
          : this.translate.instant('ERROR.ERROR_AT', {name: this.translate.instant('GRID.UPDATE_SCHEMA')});
        return this.errorSnackbarService.showSnackBar(err, fallback);
      })
    );
  }

  addMember(cohortId: number, create: CohortMemberCreateDto): Observable<CohortMemberDto> {
    return this.apiService.post<CohortMemberDto>(`${this.getBaseUrl()}/${cohortId}/members`, create).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.ERROR_AT', {name: this.translate.instant('GRID.COHORT_MEMBER_CREATION')})
      ))
    );
  }

  getAllUsers(): Observable<CohortAvailableUserDto[]> {
    return this.apiService.post<CohortAvailableUserDto[]>(`${this.getBaseUrl()}/members`, {}).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_FETCH', {name: this.translate.instant('GRID.USERS').toLowerCase()})
      ))
    );
  }

  updateMember(cohortId: number, memberId: number, update: CohortMemberDto): Observable<CohortMemberDto> {
    return this.apiService.put<CohortMemberDto>(`${this.getBaseUrl()}/${cohortId}/members/${memberId}`, update).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.ERROR_AT', {name: this.translate.instant('GRID.COHORT_MEMBER_UPDATE')})
      ))
    );
  }

  deleteMember(cohortId: number, memberId: number): Observable<void> {
    return this.apiService.delete<void>(`${this.getBaseUrl()}/${cohortId}/members/${memberId}`).pipe(
      catchError((err) => this.errorSnackbarService.showSnackBar(
        err,
        this.translate.instant('ERROR.FAILED_TO_DELETE', {name: this.translate.instant('GRID.COHORT_MEMBER').toLowerCase()})
      ))
    );
  }

  deleteCohort(cohortId: number): Observable<number> {
    return this.apiService.delete<{ cohortId?: number } | null>(
      `${this.getBaseUrl()}/${cohortId}/`,
    ).pipe(
      map(() => cohortId),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(cohortId);
        }
        if (err.status === 409) {
          const message = this.errorSnackbarService.getErrorMessage(
            err,
            this.translate.instant('COHORT_DELETION.CONFLICT'),
          );
          return this.errorSnackbarService.showSnackBarOnlyText(err, message);
        }
        return this.errorSnackbarService.showSnackBar(
          err,
          this.translate.instant('ERROR.FAILED_TO_DELETE_COHORT'),
        );
      }),
    );
  }

  pollCohortUntilDeleted(cohortId: number): Observable<CohortDeletionPollEvent> {
    return timer(0, CohortService.DELETION_POLL_INTERVAL_MS).pipe(
      switchMap(() => this.apiService.get<CohortDetailDto>(`${this.getBaseUrl()}/${cohortId}`).pipe(
        map((cohort): CohortDeletionPollEvent => ({
          type: 'in_progress',
          cohort,
        })),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            return of({type: 'completed'} as const);
          }
          return throwError(() => err);
        }),
      )),
      takeWhile((event) => {
        if (event.type === 'completed') {
          return false;
        }
        return event.cohort.deletionInProgress === true;
      }, true),
    );
  }

  notifyCohortsChanged(): void {
    this.cohortsChangedSubject.next();
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

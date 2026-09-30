import {inject, Injectable} from '@angular/core';
import {ApiService} from '@shared-lib/services/api.service';
import {environment} from '@global-app/env/environment';
import {catchError, Observable, throwError} from 'rxjs';
import {FeatureAvailableDTO} from '../dto/feature-available';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class FeatureAvailableService {
  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly translate: TranslateService = inject(TranslateService);

  private readonly apiUrl = environment.datamodelerApiUrl;
  private readonly path = 'feature-available';

  get(): Observable<FeatureAvailableDTO> {
    return this.apiService.get<FeatureAvailableDTO>(this.getBaseUrl()).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || this.translate.instant('ERROR.FAILED_TO_FETCH', {name: 'features'});
        this.snackBar.open(errorMessage, this.translate.instant('BUTTON.CLOSE'), {duration: 5000});
        return throwError(() => err);
      }));
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

import {inject, Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {environment} from '@local-app/env/environment';
import {UserInformationDTO} from '@local-app/information/dto/information.dto';

@Injectable({providedIn: 'root'})
export class UserInformationService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly errorSnackbar: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly apiUrl = environment.localLearningAPIURL;
  private readonly path = 'information';

  getBaseUserInformation(): Observable<UserInformationDTO> {
    return this.apiService.get<UserInformationDTO>(`${this.apiUrl}/${this.path}`)
      .pipe(catchError(err => this.errorSnackbar.showSnackBar(err, 'Failed to load user information')));
  }
}

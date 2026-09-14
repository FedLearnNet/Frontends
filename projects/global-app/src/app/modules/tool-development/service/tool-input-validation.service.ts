import {inject, Injectable} from "@angular/core";
import {ApiService} from "@shared-lib/services/api.service";
import {environment} from "@global-app/env/environment";
import {catchError, Observable} from "rxjs";
import {ToolConfigDTO, ToolHyperParamConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {BaseValidationResultDTO} from "@shared-lib/base/base-dto";
import {HttpHeaders} from "@angular/common/http";
import {SKIP_LOADING} from "@shared-lib/interceptors/loading.interceptor";
import {ToolHyperParamConfigValidateRequestDTO} from "../dto/tool-input-validation";
import {ApiErrorSnackbarService} from "@shared-lib/services/api-error-snackbar.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class RemoteToolInputValidationService {
  private readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly path = 'apps/validation'
  private readonly errorSnackbarService: ApiErrorSnackbarService = inject(ApiErrorSnackbarService);
  private readonly translate: TranslateService = inject(TranslateService);

  public validateHyperParamValues(value: any, config: ToolHyperParamConfigDTO): Observable<BaseValidationResultDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    const body: ToolHyperParamConfigValidateRequestDTO = {
      value,
      config
    }
    return this.apiService.post<BaseValidationResultDTO>(`${this.getBaseUrl()}/hyperparam`, body, headers)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_VALIDATE', {name: this.translate.instant('ERROR.APPS').toLowerCase()})))
      );
  }

  public validateFile(fileId: number, config: ToolConfigDTO): Observable<BaseValidationResultDTO> {
    const headers = new HttpHeaders().set(SKIP_LOADING, 'true');
    return this.apiService.post<BaseValidationResultDTO>(`${this.getBaseUrl()}/file/${fileId}`, config, headers)
      .pipe(
        catchError((err) => this.errorSnackbarService.showSnackBar(err,
          this.translate.instant('ERROR.FAILED_TO_VALIDATE', {name: this.translate.instant('ERROR.APPS').toLowerCase()})))
      );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }
}

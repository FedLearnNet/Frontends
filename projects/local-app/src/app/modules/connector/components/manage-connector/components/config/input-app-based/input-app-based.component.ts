import {Component, computed, effect, inject, linkedSignal, model, output, signal} from '@angular/core';
import {ConnectorStepConfig, ConnectorStepConfigChangeEmitter} from "../../../../../models/connector-step-config";
import {Store} from "@ngrx/store";
import {
  AppRunHyperparameterComponent
} from "@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {AppRunInputComponent} from "@shared-lib/modules/app-execution/components/app-run-input/app-run-input.component";
import {ToolHyperParamConfigDTO, ToolInputConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {selectSelectedApp, selectStoreError, selectStoreLoading} from "@shared-lib/modules/store/store/store.selectors";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {MatDivider} from "@angular/material/list";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {isAppBasedUploadSettings} from "../../../../../helper/connector-config-helper";
import {AppBasedUploadSettings} from "../../../../../models/input-config";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";
import {catchError} from "rxjs";
import {ConnectorUploadService} from "../../../../../services/connector-upload.service";
import {ConnectorDTO} from "../../../../../dto/connector";
import {ConnectorFilesDTO} from "../../../../../dto/upload-info";

@Component({
  selector: 'app-input-app-based',
  imports: [
    AppRunHyperparameterComponent,
    AppRunInputComponent,
    SkeletonLoaderComponent,
    ErrorCardComponent,
    StoreCardComponent,
    MatDivider,
    HintCardComponent
  ],
  templateUrl: './input-app-based.component.html',
  styleUrl: './input-app-based.component.scss',
})
export class InputAppBasedComponent implements ConnectorStepConfig<ConnectorDTO> {
  private readonly store: Store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly uploadService = inject(ConnectorUploadService);

  config = model.required<ConnectorDTO>();
  readonly configChange = output<ConnectorDTO>();
  readonly save = output<ConnectorStepConfigChangeEmitter>();

  appDetail = this.store.selectSignal(selectSelectedApp);
  storeLoading = this.store.selectSignal(selectStoreLoading);
  storeError = this.store.selectSignal(selectStoreError);

  settings = signal<AppBasedUploadSettings | undefined>(undefined);

  name = computed(() => this.appDetail()?.name)
  inputHyperParams = computed(() => this.settings()?.hyperParams)

  inputs: { [key: string]: any } = {};

  inputValid: boolean = true;
  hyperParamValid: boolean = true;

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (!cfg) {
        return;
      }
      const input = cfg.inputConfig;
      const id = cfg.inputSource?.id;
      if (id) {
        this.store.dispatch(StoreActions.loadAppByVersion({appVersionId: +id}));
      }
      if (input && isAppBasedUploadSettings(input)) {
        this.settings.set(input);
        if (!id && input.appVersionId) {
          this.store.dispatch(StoreActions.loadAppByVersion({appVersionId: input.appVersionId}));
        }
      }
    });
    effect(() => {
      const appDetail = this.appDetail();
      if (!appDetail) {
        return;
      }
      this.settings.update(s => {
        if (!s) {
          s = {} as any;
        }
        s!.appImage = appDetail.imageName!;
        s!.appVersionId = appDetail.latestVersionId!;
        s!.appTitle = appDetail.name;
        return s;
      });
    });
  }

  hyperParams = linkedSignal(() => {
    const inputHyperParams = this.inputHyperParams() ?? {};
    const app = this.appDetail();
    if (!app) {
      return inputHyperParams;
    }
    return Object.fromEntries(
      app.appConfig.hyperparams.map(entry => {
        const key = this.getHyperParamName(entry);
        return [
          key,
          key in inputHyperParams
            ? inputHyperParams[key]
            : entry.default
        ];
      })
    );
  });

  hasHyperParams = computed(() => {
    const app = this.appDetail();
    const hp = app?.appConfig?.hyperparams;
    return Array.isArray(hp) && hp.length > 0;
  });

  hasInputs = computed(() => {
    const app = this.appDetail();
    const inputs = app?.appConfig?.input;
    return Array.isArray(inputs) && inputs.length > 0;
  });

  changeInput(data: { [key: string]: any }): void {
    let allValid = true;
    const input: ToolInputConfigDTO[] = this.appDetail()?.appConfig.input ?? [];
    input.forEach((input) => {
      const name = input.variableName ?? input.name;
      const isRequired = input.required;
      if (isRequired) {
        if (!data[name] || data[name].length === 0) {
          allValid = false;
        }
      }
      if (this.isFileValue(data[name])) {
        this.onFileSelected(name, data[name]);
      }
    });
    this.inputValid = allValid;
    this.inputs = data;
  }


  private isFileValue(v: any): v is File | FileList | File[] {
    if (!v) return false;
    if (v instanceof File) return true;
    if (v instanceof FileList) return true;
    return (Array.isArray(v) && v.length > 0 && v.every((x) => x instanceof File))
  }

  onFileSelected(key: string, value: File | FileList | File[]): void {
    const file: File | null =
      value instanceof File ? value :
        value instanceof FileList ? (value.item(0) ?? null) :
          Array.isArray(value) ? (value[0] ?? null) :
            null;

    if (!file) return;
    this.uploadService.uploadFile(this.config().cohortId!, file).pipe(
      catchError((error) => {
        console.error(this.translate.instant('ERROR.ERROR_IMPORTING_FILE'), error);
        this.snackBar.open(
          this.translate.instant('ERROR.ERROR_OCCURRED_PLEASE_TRY_AGAIN'),
          this.translate.instant('BUTTON.CLOSE'), {
            duration: 5000,
            verticalPosition: 'top',
          });
        throw error;
      })
    ).subscribe((response: ConnectorFilesDTO): void => {
      this.inputs[key] = response.id;
    });
  }

  get isValid(): boolean {
    return this.inputValid && this.hyperParamValid;
  }

  getHyperParamName(hyperparam: ToolHyperParamConfigDTO): string {
    return hyperparam.variableName ? hyperparam.variableName : hyperparam.name;
  }

  onContinueClick(): boolean {
    if (!this.isValid) {
      this.snackBar.open(
        this.translate.instant('WARNING.PLEASE_IMPORT_A_FILE'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return false;
    }
    const inputConfig = this.settings();
    if (!inputConfig) {
      return false;
    }
    inputConfig.hyperParams = this.hyperParams();
    inputConfig.inputData = this.inputs;
    inputConfig.mode = "APP";
    this.config.update(c => {
      return {
        ...c,
        inputConfig: inputConfig
      }
    });

    this.configChange.emit(this.config());
    return true;
  }

}

import {Component, computed, effect, inject, input, linkedSignal, model, output, signal} from '@angular/core';
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
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {catchError, EMPTY, finalize} from "rxjs";
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
    HintCardComponent,
    TranslatePipe
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
  readonly displayMode = input<'PAGE' | 'DIALOG'>('PAGE');
  readonly validityChange = output<boolean>();
  readonly uploadingChange = output<boolean>();

  appDetail = this.store.selectSignal(selectSelectedApp);
  storeLoading = this.store.selectSignal(selectStoreLoading);
  storeError = this.store.selectSignal(selectStoreError);

  settings = signal<AppBasedUploadSettings | undefined>(undefined);

  name = computed(() => this.appDetail()?.name)
  inputHyperParams = computed(() => this.settings()?.hyperParams)

  readonly inputs = signal<{ [key: string]: any }>({});
  readonly hyperParamValid = signal(true);
  private readonly pendingUploads = signal(0);
  readonly uploading = computed(() => this.pendingUploads() > 0);
  readonly isValid = computed(() => {
    const app = this.appDetail();
    if (!app || this.uploading() || !this.hyperParamValid()) {
      return false;
    }
    return app.appConfig.input
      .filter(appInput => appInput.required)
      .every(appInput => this.hasValue(this.inputs()[this.getInputName(appInput)]));
  });

  private loadedVersionId?: number;

  private readonly baseline = signal<string | undefined>(undefined);
  readonly hasUserChanges = computed(() => {
    const baseline = this.baseline();
    return baseline !== undefined && baseline !== this.configurationSnapshot();
  });

  constructor() {
    effect(() => {
      const cfg = this.config();
      if (!cfg) {
        return;
      }
      const input = cfg.inputConfig;
      const id = Number(cfg.inputSource?.id || (input && isAppBasedUploadSettings(input) ? input.appVersionId : 0));
      if (id && id !== this.loadedVersionId) {
        this.loadedVersionId = id;
        this.store.dispatch(StoreActions.loadAppByVersion({appVersionId: id}));
      }
      if (input && isAppBasedUploadSettings(input)) {
        this.settings.set({
          ...input,
          hyperParams: {...(input.hyperParams ?? {})},
          inputData: {...(input.inputData ?? {})},
        });
        this.inputs.set({...input.inputData});
      }
    });
    effect(() => {
      const appDetail = this.appDetail();
      if (!appDetail) {
        return;
      }
      this.settings.update(s => ({
        ...(s ?? {} as AppBasedUploadSettings),
        appImage: appDetail.imageName!,
        appVersionId: this.loadedVersionId ?? appDetail.latestVersionId!,
        appTitle: appDetail.name,
        mode: 'APP',
        hyperParams: s?.hyperParams ?? {},
        inputData: s?.inputData ?? {},
      }));
    });
    effect(() => {
      this.validityChange.emit(this.isValid());
      this.uploadingChange.emit(this.uploading());
    });
    effect(onCleanup => {
      if (this.baseline() !== undefined || !this.appDetail() || this.storeLoading()) {
        return;
      }
      const snapshot = this.configurationSnapshot();
      const handle = setTimeout(() => {
        if (this.baseline() === undefined) {
          this.baseline.set(snapshot);
        }
      });
      onCleanup(() => clearTimeout(handle));
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
    const next = {...data};
    const appInputs: ToolInputConfigDTO[] = this.appDetail()?.appConfig.input ?? [];
    appInputs.forEach(appInput => {
      const name = this.getInputName(appInput);
      if (this.isFileValue(next[name])) {
        const previousValue = this.inputs()[name];
        if (previousValue === undefined) {
          delete next[name];
        } else {
          next[name] = previousValue;
        }
        this.onFileSelected(name, data[name]);
      }
    });
    this.inputs.set(next);
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
    this.pendingUploads.update(count => count + 1);
    this.uploadService.uploadFile(this.config().cohortId!, file).pipe(
      catchError((error) => {
        console.error(this.translate.instant('ERROR.ERROR_IMPORTING_FILE'), error);
        this.snackBar.open(
          this.translate.instant('ERROR.ERROR_OCCURRED_PLEASE_TRY_AGAIN'),
          this.translate.instant('BUTTON.CLOSE'), {
            duration: 5000,
            verticalPosition: 'top',
          });
        return EMPTY;
      }),
      finalize(() => this.pendingUploads.update(count => Math.max(0, count - 1)))
    ).subscribe((response: ConnectorFilesDTO): void => {
      if (response.id) {
        this.inputs.update(inputs => ({...inputs, [key]: response.id}));
      }
    });
  }

  getHyperParamName(hyperparam: ToolHyperParamConfigDTO): string {
    return hyperparam.variableName ? hyperparam.variableName : hyperparam.name;
  }

  markPristine(): void {
    this.baseline.set(this.configurationSnapshot());
  }

  getConfiguredConnector(): ConnectorDTO | undefined {
    const inputConfig = this.settings();
    if (!inputConfig || !this.isValid()) {
      return undefined;
    }
    return {
      ...this.config(),
      inputConfig: {
        ...inputConfig,
        hyperParams: {...this.hyperParams()},
        inputData: {...this.inputs()},
        mode: 'APP',
      }
    };
  }

  onContinueClick(): boolean {
    const configuredConnector = this.getConfiguredConnector();
    if (!configuredConnector) {
      this.snackBar.open(
        this.translate.instant('WARNING.PLEASE_FILL_REQUIRED_FIELDS'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 5000,
          verticalPosition: 'top',
        });
      return false;
    }
    this.config.set(configuredConnector);

    this.configChange.emit(this.config());
    return true;
  }

  private configurationSnapshot(): string {
    return JSON.stringify({
      hyperParams: this.hyperParams(),
      inputs: this.inputs(),
    });
  }

  private getInputName(appInput: ToolInputConfigDTO): string {
    return appInput.variableName ?? appInput.name;
  }

  private hasValue(value: unknown): boolean {
    return value !== null
      && value !== undefined
      && value !== ''
      && (!Array.isArray(value) || value.length > 0);
  }
}

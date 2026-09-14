import {Component, computed, inject, input, model, output, signal, viewChild} from '@angular/core';
import {
  AppDetailConfigHyperparamComponent
} from "./components/app-detail-config-hyperparam/app-detail-config-hyperparam.component";
import {AppDetailConfigInputComponent} from "./components/app-detail-config-input/app-detail-config-input.component";
import {AppEditComponent} from "./components/app-edit/app-edit.component";
import {MatTabsModule} from "@angular/material/tabs";
import {AppDetailConfigOutputComponent} from "./components/app-detail-config-output/app-detail-config-output.component";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {MatIcon} from "@angular/material/icon";
import {AppClientConfigComponent} from "./components/app-client-config/app-client-config.component";

import {
  ConfigHyperparamEditModel,
  ConfigInputEditModel,
  ConfigOutputEditModel
} from "@shared-lib/modules/app-execution/model/config";
import {ClientConfigDTO, ConfigPydanticDTO} from "../../dto/config";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {LocalFiles} from "@shared-lib/modules/files/dto/file";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {selectAllFiles} from "@shared-lib/modules/files/store/file.selectors";
import {Store} from "@ngrx/store";
import {StartAppWarningComponent} from "../start-app-warning/start-app-warning.component";
import {ToolConfigsDTO} from "@shared-lib/modules/app-execution/dto/config";
import {AppService} from "../../service/app.service";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {environment} from "@global-app/env/environment";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-app-detail-config',
  imports: [
    MatTabsModule,
    AppDetailConfigHyperparamComponent,
    AppDetailConfigInputComponent,
    AppEditComponent,
    AppDetailConfigOutputComponent,
    MatIcon,
    AppClientConfigComponent,
    TranslatePipe,
    ErrorCardComponent,
    StartAppWarningComponent,
    BtnComponent,
  ],
  templateUrl: './app-detail-config.component.html',
  styleUrl: './app-detail-config.component.scss'
})
export class AppDetailConfigComponent {
  private readonly store: Store = inject(Store);
  private readonly appService: AppService = inject(AppService);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly translate: TranslateService = inject(TranslateService);

  readonly datafiles = input<LocalFiles[]>([]);
  readonly clientConfig = input<ClientConfigDTO>({} as ClientConfigDTO);
  readonly pydanticClass = input<ConfigPydanticDTO>();
  readonly appConnected = input<boolean | undefined>(false);
  readonly uiConnected = input<boolean>(false);
  readonly files = this.store.selectSignal(selectAllFiles);

  readonly app = model<AppDetailDto | undefined>(undefined);

  readonly published = output<AppDetailDto>();
  readonly selectedIndex = signal<number>(0);
  readonly appEditFormValid = signal<boolean>(false);

  appEdit = viewChild<AppEditComponent>("appEdit");

  hideAppEditActions = computed(() => this.appEdit() !== undefined);

  readonly isProduction = environment.production;

  setSelectedIndex(index: number): void {
    this.selectedIndex.set(index);
  }


  configHyperparamChanged(hyperparams: ConfigHyperparamEditModel[]) {
    if (this.app()) {
      const currentConfig: ToolConfigsDTO = this.app()?.appConfig ?? {} as ToolConfigsDTO;
      this.configChanged({
        ...currentConfig,
        hyperparams: hyperparams
      });
    }
  }

  configInputChanged(inputConfig: ConfigInputEditModel[]) {
    if (this.app()) {
      const currentConfig: ToolConfigsDTO = this.app()?.appConfig ?? {} as ToolConfigsDTO;
      this.configChanged({
        ...currentConfig,
        input: inputConfig
      });
    }
  }

  configOutputChanged(config: ConfigOutputEditModel[]) {
    if (this.app()) {
      const currentConfig: ToolConfigsDTO = this.app()?.appConfig ?? {} as ToolConfigsDTO;
      this.configChanged({
        ...currentConfig,
        output: config
      });
    }
  }

  configChanged(config: ToolConfigsDTO) {
    const app = this.app();
    if (!app) return;
    const prev = app.appConfig ?? ({} as ToolConfigsDTO);
    if (this.configEquals(prev, config)) return;
    this.app.update(a => ({
      ...a!,
      appConfig: config
    }));
  }

  private configEquals(a?: ToolConfigsDTO | null, b?: ToolConfigsDTO | null): boolean {
    const aClean = this.removeEditModeKeys(a ?? {});
    const bClean = this.removeEditModeKeys(b ?? {});
    const result = JSON.stringify(aClean) === JSON.stringify(bClean);
    return result;
  }

  private removeEditModeKeys(config: ToolConfigsDTO | Record<string, unknown>): any {
    if (!config || typeof config !== 'object') {
      return config;
    }
    const cleaned = JSON.parse(JSON.stringify(config));

    const removeEditMode = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(item => removeEditMode(item));
      } else if (obj !== null && typeof obj === 'object') {
        const {editMode, ...rest} = obj;
        return Object.keys(rest).reduce((acc, key) => {
          acc[key] = removeEditMode(rest[key]);
          return acc;
        }, {} as any);
      }
      return obj;
    };

    return removeEditMode(cleaned);
  }

  configInfoChanged(app: AppDetailDto) {
    if (this.app()) {
      this.app.set({
        ...app,
      });
    }
  }

  protected updateApp() {
    this.appEdit()?.update();
  }

  protected publishApp() {
    this.appEdit()?.publish();
  }

  protected cancel() {
    this.appEdit()?.cancelEdit();
  }

  protected saveToolAsJson() {
    const app = this.app();
    if (app?.id) {
      this.appService.exportAppAsJson(app.id).subscribe((path) => {
          if (!path) {
            path = "Error";
          }
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: this.translate.instant('DIALOG.EXPORT_TOOL.TITLE'),
              message: this.translate.instant('DIALOG.EXPORT_TOOL.MESSAGE') + path,
              confirmButtonText: this.translate.instant('DIALOG.OK'),
            },
          });
        }
      )
    }
  }

  protected replaceBuildInfoInJson() {
    const app = this.app();
    if (app?.id) this.appService.replaceBuildInfoInJson(app.id).subscribe();
  }
}

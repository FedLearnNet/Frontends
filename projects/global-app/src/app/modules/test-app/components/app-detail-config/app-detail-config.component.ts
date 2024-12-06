import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  AppDetailConfigHyperparamComponent
} from "./components/app-detail-config-hyperparam/app-detail-config-hyperparam.component";
import {ClientConfigDTO, ConfigPydanticDTO} from "../../dto/config";
import {ConfigHyperparamEditModel, ConfigInputEditModel, ConfigOutputEditModel} from "../../model/config";
import {AppDetailConfigInputComponent} from "./components/app-detail-config-input/app-detail-config-input.component";
import {AppEditComponent} from "./components/app-edit/app-edit.component";
import {MatTab, MatTabsModule} from "@angular/material/tabs";
import {AppDto} from "@global-app/app-store/dto/app";
import {AppDetailConfigOutputComponent} from "./components/app-detail-config-output/app-detail-config-output.component";
import {Observable} from "rxjs";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {AppDetailSetupComponent} from "../app-detail-setup/app-detail-setup.component";
import {MatIcon} from "@angular/material/icon";
import {AppClientConfigComponent} from "./components/app-client-config/app-client-config.component";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'app-app-detail-config',
  standalone: true,
  imports: [
    MatTabsModule,
    AppDetailConfigHyperparamComponent,
    AppDetailConfigInputComponent,
    AppEditComponent,
    AppDetailConfigOutputComponent,
    AppDetailSetupComponent,
    MatIcon,
    AppClientConfigComponent,
    AsyncPipe
  ],
  templateUrl: './app-detail-config.component.html',
  styleUrl: './app-detail-config.component.scss'
})
export class AppDetailConfigComponent {
  @Input() app?: AppDetailDto;
  @Input() pydanticClass?: ConfigPydanticDTO;
  @Input() appConnected?: boolean = false;
  @Input() clientConfig?: ClientConfigDTO;
  @Input() datafiles: string[] = [];

  @Output() configChanged: EventEmitter<AppDetailDto> = new EventEmitter<AppDetailDto>();
  @Output() piblished: EventEmitter<AppDetailDto> = new EventEmitter<AppDetailDto>();

  test = {} as AppDto;

  configHyperparamChanged(hyperparams: ConfigHyperparamEditModel[]) {
    if (this.app) {
      this.app.appConfig.hyperparams = hyperparams;
      this.configChanged.emit(this.app);
    }
  }

  configInputChanged(config: ConfigInputEditModel[]) {
    if (this.app) {
      this.app.appConfig.input = config;
      this.configChanged.emit(this.app);
    }
  }
  configOutputChanged(config: ConfigOutputEditModel[]) {
    if (this.app) {
      this.app.appConfig.output = config;
      this.configChanged.emit(this.app);
    }
  }
  configInfoChanged(config: AppDetailDto) {
    if (this.app) {
      config.appConfig = this.app.appConfig;
      this.app = config;
      this.configChanged.emit(this.app);
    }
  }
}

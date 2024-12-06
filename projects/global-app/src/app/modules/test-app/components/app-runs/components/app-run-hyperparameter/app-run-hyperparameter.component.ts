import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ConfigHyperparamDTO, FederatedAppConfigModeType} from "../../../../dto/config";
import {
  AppHyperParamInputComponent
} from "../../../app-detail-config/components/app-hyper-param-input/app-hyper-param-input.component";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";

@Component({
  selector: 'app-app-run-hyperparameter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    AppHyperParamInputComponent
  ],
  templateUrl: './app-run-hyperparameter.component.html',
  styleUrl: './app-run-hyperparameter.component.scss'
})
export class AppRunHyperparameterComponent implements OnInit, OnChanges {
  @Input() app?: AppDetailDto;
  @Input() version?: AppVersionDto;
  @Input() allowMods: FederatedAppConfigModeType[] = [FederatedAppConfigModeType.BOTH,
    FederatedAppConfigModeType.TRAINING];
  @Input() dynamicHyperParams: { [key: string]: any } = {};

  @Input() allowMultiple: boolean = false;
  @Output() hyperParamsChanged: EventEmitter<{ [key: string]: any }> = new EventEmitter<{ [key: string]: any }>();
  @Output() multiHyperParamsChanged: EventEmitter<{ [key: string]: any[] }> = new EventEmitter<{ [key: string]: any[] }>();
  @Output() formsValid: EventEmitter<boolean> = new EventEmitter<boolean>();

  allValid:{ [key: string]: any } = {};
  multiHyperParams: { [key: string]: any[] } = {};


  ngOnInit(): void {
    this.createDynamicHyperparams();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["config"]) {
      this.createDynamicHyperparams();
    }
  }

  getHyperParams(): ConfigHyperparamDTO[] {
    if (this.app) {
      return this.app?.appConfig.hyperparams.filter(
        (hyperparam) => this.hyperParamModeApplies(hyperparam)
      );
    }
    if (this.version) {
      return this.version?.appConfig.hyperparams.filter(
        (hyperparam) => this.hyperParamModeApplies(hyperparam)
      );
    }
    return [];
  }

  hyperParamModeApplies(hyperparam: ConfigHyperparamDTO): boolean {
    if (this.allowMods.includes(FederatedAppConfigModeType.BOTH)) {
      return true;
    }
    if (this.allowMods.includes(FederatedAppConfigModeType.TRAINING) && hyperparam.mode === FederatedAppConfigModeType.TRAINING) {
      return true;
    }
    if (this.allowMods.includes(FederatedAppConfigModeType.PREDICTION) && hyperparam.mode === FederatedAppConfigModeType.PREDICTION) {
      return true;
    }
    return false;
  }

  private getHyperParamName(hyperparam: ConfigHyperparamDTO): string {
    return hyperparam.variableName ? hyperparam.variableName : hyperparam.name;
  }

  private createDynamicHyperparams() {
    if (this.app || this.version) {
      this.getHyperParams().forEach(hyperparam => {
        if (this.dynamicHyperParams[this.getHyperParamName(hyperparam)] === undefined) {
          this.dynamicHyperParams[this.getHyperParamName(hyperparam)] = hyperparam.default;
        }
      });
      this.hyperParamsChanged.emit(this.dynamicHyperParams);
    }
  }

  public validateForms(hyperparam: ConfigHyperparamDTO, value: boolean) {
    this.allValid[this.getHyperParamName(hyperparam)] = value;
    this.formsValid.emit(Object.values(this.allValid).every((value) => value));
  }
  public getHyperParamValue(hyperparam: ConfigHyperparamDTO): string {
    return this.dynamicHyperParams[this.getHyperParamName(hyperparam)];
  }

  public emitMultiHyperParamsChanged(hyperparam: ConfigHyperparamDTO, values: string[]) {
    this.multiHyperParams[this.getHyperParamName(hyperparam)] = values;
    this.multiHyperParamsChanged.emit(this.multiHyperParams);
  }

  public emitHyperParamsChanged(hyperparam: ConfigHyperparamDTO, value: string) {
    this.dynamicHyperParams[this.getHyperParamName(hyperparam)] = value;
    this.hyperParamsChanged.emit(this.dynamicHyperParams);
  }
}

import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {
  ConfigHyperparamDTO,
  ConfigPydanticDTO, FederatedAppConfigHyperParamDataType,
  FederatedAppConfigModeType,
  FederatedAppConfigOutputDataType
} from "../../../../dto/config";
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {ConfigHyperparamEditModel} from "../../../../model/config";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {MatTooltip, MatTooltipModule} from "@angular/material/tooltip";
import {AppDetailConfigModeIconComponent} from "../app-detail-config-mode-icon/app-detail-config-mode-icon.component";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {MatOptionModule} from "@angular/material/core";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {AppHyperParamInputComponent} from "../app-hyper-param-input/app-hyper-param-input.component";

@Component({
  selector: 'app-app-detail-config-hyperparam',
  standalone: true,
  imports: [CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MarkdownComponent,
    MatTooltipModule,
    MatSelectModule,
    MatOptionModule,
    AppDetailConfigModeIconComponent,
    MatChipsModule, AppHyperParamInputComponent,],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './app-detail-config-hyperparam.component.html',
  styleUrl: './app-detail-config-hyperparam.component.scss'
})
export class AppDetailConfigHyperparamComponent {
  protected readonly FederatedAppConfigHyperParamDataType = FederatedAppConfigHyperParamDataType;

  @Input() hyperparams: ConfigHyperparamEditModel[] = [];
  @Input() editMode?: boolean = true;
  @Input() pydanticClass?: ConfigPydanticDTO;
  @Output() configChanged: EventEmitter<ConfigHyperparamEditModel[]> = new EventEmitter<ConfigHyperparamEditModel[]>();

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly federatedAppConfigDataTypeText: { [key in FederatedAppConfigHyperParamDataType]: string } = {
    [FederatedAppConfigHyperParamDataType.FLOAT]: 'float',
    [FederatedAppConfigHyperParamDataType.CATEGORICAL]: 'categorical',
    [FederatedAppConfigHyperParamDataType.INTEGER]: 'int',
    [FederatedAppConfigHyperParamDataType.BOOLEAN]: 'bool',
    [FederatedAppConfigHyperParamDataType.STRING]: 'string',
  };


  getDataTypes(): FederatedAppConfigHyperParamDataType[] {
    return Object.values(FederatedAppConfigHyperParamDataType);
  }

  addParam() {
    this.hyperparams.push({
      name: '',
      type: FederatedAppConfigHyperParamDataType.INTEGER,
      description: '',
      default: '',
      editMode: true,
      mode: FederatedAppConfigModeType.TRAINING
    });
  }

  removeParam(el: ConfigHyperparamEditModel) {
    this.hyperparams = this.hyperparams.filter(h => h !== el);
  }

  editParam(el: ConfigHyperparamEditModel) {
    el.editMode = true;
  }

  saveParam(el: ConfigHyperparamEditModel) {
    el.editMode = false;
    this.configChanged.emit(this.hyperparams);
  }

  getPydanticClass(): string {
    if (this.pydanticClass) {
      return "```python\n" + this.pydanticClass.hyperparam + "\n```";
    }
    return '';
  }

  addOption(param: ConfigHyperparamEditModel, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      if (!param.options) {
        param.options = [];
      }
      param.options = [...param.options, value];
    }
    event.chipInput!.clear();
  }

  removeOption(param: ConfigHyperparamEditModel, option: string): void {
    if (!param.options) {
      return;
    }
    const index = param.options.indexOf(option);
    if (index < 0) {
      return;
    }

    param.options.splice(index, 1);
  }

  editOption(param: ConfigHyperparamEditModel, option: string, event: MatChipEditedEvent) {
    if (!param.options) {
      return;
    }
    const value = event.value.trim();

    if (!value) {
      this.removeOption(param, option);
      return;
    }

    const index = param.options.indexOf(option);
    if (index >= 0) {
      param.options[index] = value;
    }
  }

}

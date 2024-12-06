import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConfigHyperparamEditModel, ConfigInputEditModel} from "../../../../model/config";
import {CommonModule} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {AbstractControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {Observable} from "rxjs";
import {ConfigPydanticDTO, FederatedAppConfigInputDataType, FederatedAppConfigModeType} from "../../../../dto/config";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {AppDetailConfigModeIconComponent} from "../app-detail-config-mode-icon/app-detail-config-mode-icon.component";
import {MatCheckboxModule} from "@angular/material/checkbox";

@Component({
  selector: 'app-app-detail-config-input',
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
    MatCheckboxModule,
    MatSelectModule,
    MarkdownComponent,
    AppDetailConfigModeIconComponent],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './app-detail-config-input.component.html',
  styleUrl: './app-detail-config-input.component.scss'
})
export class AppDetailConfigInputComponent {
  @Input() configs: ConfigInputEditModel[] = [];
  @Input() editMode?: boolean = true;
  @Input() pydanticClass?: ConfigPydanticDTO;
  @Output() configChanged: EventEmitter<ConfigInputEditModel[]> = new EventEmitter<ConfigInputEditModel[]>();

  readonly federatedAppConfigDataTypeText: { [key in FederatedAppConfigInputDataType]: string } = {
    [FederatedAppConfigInputDataType.CSV]: 'csv',
    [FederatedAppConfigInputDataType.JSON]: 'json',
    [FederatedAppConfigInputDataType.MIXED]: 'mixed',
    [FederatedAppConfigInputDataType.FLOAT]: 'float',
    [FederatedAppConfigInputDataType.INTEGER]: 'int',
    [FederatedAppConfigInputDataType.STRING]: 'string',
    [FederatedAppConfigInputDataType.BOOLEAN]: 'bool',
    [FederatedAppConfigInputDataType.CATEGORICAL]: 'categorical',
    [FederatedAppConfigInputDataType.IMAGE]: 'image',
    [FederatedAppConfigInputDataType.TEXT]: 'text',
    [FederatedAppConfigInputDataType.AUDIO]: 'audio',
    [FederatedAppConfigInputDataType.TIME_SERIES]: 'time series',
    [FederatedAppConfigInputDataType.SPARSE]: 'sparse',
    [FederatedAppConfigInputDataType.TENSOR]: 'tensor',
  };

  readonly federatedAppConfigDataTypeUsable: { [key in FederatedAppConfigInputDataType]: boolean } = {
    [FederatedAppConfigInputDataType.CSV]: true,
    [FederatedAppConfigInputDataType.JSON]: true,
    [FederatedAppConfigInputDataType.MIXED]: true,
    [FederatedAppConfigInputDataType.FLOAT]: true,
    [FederatedAppConfigInputDataType.INTEGER]: true,
    [FederatedAppConfigInputDataType.STRING]: false,
    [FederatedAppConfigInputDataType.BOOLEAN]: false,
    [FederatedAppConfigInputDataType.CATEGORICAL]: false,
    [FederatedAppConfigInputDataType.IMAGE]: false,
    [FederatedAppConfigInputDataType.TEXT]: false,
    [FederatedAppConfigInputDataType.AUDIO]: false,
    [FederatedAppConfigInputDataType.TIME_SERIES]: false,
    [FederatedAppConfigInputDataType.SPARSE]: false,
    [FederatedAppConfigInputDataType.TENSOR]: false,
  };

  getDataTypes(): FederatedAppConfigInputDataType[] {
    return Object.values(FederatedAppConfigInputDataType);
  }

  addParam() {
    this.configs.push({name: '',
      type: FederatedAppConfigInputDataType.CSV,
      description: '',
      editMode: true,
      required: false,
      mode: FederatedAppConfigModeType.TRAINING});
  }

  removeParam(el: ConfigInputEditModel) {
    this.configs = this.configs.filter(h => h !== el);
  }

  editParam(el: ConfigInputEditModel) {
    el.editMode = true;
  }

  saveParam(el: ConfigInputEditModel) {
    el.editMode = false;
    this.configChanged.emit(this.configs);
  }

  inputRequiresShape(input: ConfigInputEditModel): boolean {
    const type = input.type;
    return [
      FederatedAppConfigInputDataType.FLOAT,
      FederatedAppConfigInputDataType.INTEGER,
      FederatedAppConfigInputDataType.TENSOR,
      FederatedAppConfigInputDataType.IMAGE,
      FederatedAppConfigInputDataType.AUDIO,
      FederatedAppConfigInputDataType.TIME_SERIES,
      FederatedAppConfigInputDataType.SPARSE,
      FederatedAppConfigInputDataType.MIXED,
    ].includes(type);
  }

  inputRequiresConstraints(input: ConfigInputEditModel): boolean {
    const type = input.type;
    return [FederatedAppConfigInputDataType.FLOAT, FederatedAppConfigInputDataType.INTEGER].includes(type);
  }


  getPydanticClass(): string {
    if (this.pydanticClass) {
      return "```python\n" + this.pydanticClass.input + "\n```";
    }
    return '';
  }
}

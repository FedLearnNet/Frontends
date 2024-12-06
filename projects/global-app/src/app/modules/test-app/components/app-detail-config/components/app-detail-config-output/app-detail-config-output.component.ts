import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton, MatButtonModule, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardModule, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import {CommonModule} from "@angular/common";
import {MatMenuModule} from "@angular/material/menu";
import {ConfigInputEditModel, ConfigOutputEditModel} from "../../../../model/config";
import {
  ConfigPydanticDTO,
  FederatedAppConfigInputDataType,
  FederatedAppConfigModeType,
  FederatedAppConfigOutputDataType
} from "../../../../dto/config";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {AppDetailConfigModeIconComponent} from "../app-detail-config-mode-icon/app-detail-config-mode-icon.component";

@Component({
  selector: 'app-app-detail-config-output',
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
    MatSelectModule, MarkdownComponent, AppDetailConfigModeIconComponent],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './app-detail-config-output.component.html',
  styleUrl: './app-detail-config-output.component.scss'
})
export class AppDetailConfigOutputComponent {
  @Input() configs: ConfigOutputEditModel[] = [];
  @Input() editMode?: boolean = true;
  @Input() pydanticClass?: ConfigPydanticDTO;
  @Output() configChanged: EventEmitter<ConfigOutputEditModel[]> = new EventEmitter<ConfigOutputEditModel[]>();

  readonly federatedAppConfigDataTypeText: { [key in FederatedAppConfigOutputDataType]: string } = {
    [FederatedAppConfigOutputDataType.CSV]: 'csv',
    [FederatedAppConfigOutputDataType.JSON]: 'json',
    [FederatedAppConfigOutputDataType.MIXED]: 'mixed',
    [FederatedAppConfigOutputDataType.FLOAT]: 'float',
    [FederatedAppConfigOutputDataType.INTEGER]: 'int',
    [FederatedAppConfigOutputDataType.STRING]: 'string',
    [FederatedAppConfigOutputDataType.HTML]: 'bool'
  };

  getDataTypes(): FederatedAppConfigOutputDataType[] {
    return Object.values(FederatedAppConfigOutputDataType);
  }

  addParam() {
    this.configs.push({
      name: '',
      type: FederatedAppConfigOutputDataType.CSV,
      description: '',
      editMode: true,
      mode: FederatedAppConfigModeType.TRAINING
    });
  }

  removeParam(el: ConfigOutputEditModel) {
    this.configs = this.configs.filter(h => h !== el);
  }

  editParam(el: ConfigOutputEditModel) {
    el.editMode = true;
  }

  saveParam(el: ConfigOutputEditModel) {
    el.editMode = false;
    this.configChanged.emit(this.configs);
  }

  outputRequiresShape(output: ConfigOutputEditModel): boolean {
    const type = output.type;
    return [
      FederatedAppConfigOutputDataType.FLOAT,
      FederatedAppConfigOutputDataType.INTEGER,
      FederatedAppConfigOutputDataType.MIXED,
      FederatedAppConfigOutputDataType.STRING,
    ].includes(type);
  }

  outputRequiresConstraints(output: ConfigOutputEditModel): boolean {
    const type = output.type;
    return [
      FederatedAppConfigOutputDataType.FLOAT,
      FederatedAppConfigOutputDataType.INTEGER
    ].includes(type);
  }


  getPydanticClass(): string {
    if (this.pydanticClass) {
      return "```python\n" + this.pydanticClass.output + "\n```";
    }
    return '';
  }
}

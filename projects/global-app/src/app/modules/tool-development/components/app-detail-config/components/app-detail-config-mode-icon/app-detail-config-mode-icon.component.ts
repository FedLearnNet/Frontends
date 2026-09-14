import {Component, Input, OnInit, input, output} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatFormField} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";

import {FormsModule} from "@angular/forms";

import {ToolConfigModeType} from "@shared-lib/modules/app-execution/dto/config";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
    selector: 'app-app-detail-config-mode-icon',
    imports: [
    MatIconModule,
    MatTooltipModule,
    MatFormField,
    MatSelectModule,
    FormsModule,
    TranslatePipe
],
    templateUrl: './app-detail-config-mode-icon.component.html',
    styleUrl: './app-detail-config-mode-icon.component.scss'
})
export class AppDetailConfigModeIconComponent implements OnInit {
  readonly editMode = input<boolean>();
  readonly hasSpace = input<boolean>(false);

  @Input() mode: ToolConfigModeType;

  readonly modeChanged = output<ToolConfigModeType>();

  editedMode: string;

  ngOnInit() {
    if (this.mode) {
      this.editedMode = this.mode.toString();
    }
  }


  changeMode() {
    this.mode = this.editedMode as ToolConfigModeType;
    this.modeChanged.emit(this.mode);
  }

  getAllModes() {
    return Object.values(ToolConfigModeType);
  }

  isTrainingMode() {
    return this.mode === ToolConfigModeType.TRAINING;
  }

  isPredictionMode() {
    return this.mode === ToolConfigModeType.PREDICTION;
  }
}

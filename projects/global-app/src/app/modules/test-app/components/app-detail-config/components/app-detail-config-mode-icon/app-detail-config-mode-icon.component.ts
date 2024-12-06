import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatCardAvatar} from "@angular/material/card";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatTooltip, MatTooltipModule} from "@angular/material/tooltip";
import {FederatedAppConfigModeType} from "../../../../dto/config";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-app-detail-config-mode-icon',
  standalone: true,
  imports: [
    MatCardAvatar,
    MatIconModule,
    MatTooltipModule,
    MatFormField,
    MatSelectModule,
    CommonModule,
    FormsModule

  ],
  templateUrl: './app-detail-config-mode-icon.component.html',
  styleUrl: './app-detail-config-mode-icon.component.scss'
})
export class AppDetailConfigModeIconComponent implements OnInit {
  @Input() mode: FederatedAppConfigModeType;
  @Input() editMode?: boolean;
  @Input() hasSpace: boolean = false;
  @Output() modeChanged: EventEmitter<FederatedAppConfigModeType> = new EventEmitter<FederatedAppConfigModeType>();

  editedMode: string;

  ngOnInit() {
    if(this.mode) {
      this.editedMode = this.mode.toString();
    }
  }


  changeMode() {
    this.mode = this.editedMode as FederatedAppConfigModeType;
    this.modeChanged.emit(this.mode);
  }

  getAllModes() {
    return Object.values(FederatedAppConfigModeType);
  }

  isTrainingMode() {
    return this.mode === FederatedAppConfigModeType.TRAINING;
  }

  isPredictionMode() {
    return this.mode === FederatedAppConfigModeType.PREDICTION;
  }
}

import {Component, inject} from '@angular/core';
import {
  AppDetailConfigInputComponent
} from "../../../../../../../global-app/src/app/modules/tool-development/components/app-detail-config/components/app-detail-config-input/app-detail-config-input.component";
import {
  AppDetailConfigOutputComponent
} from "../../../../../../../global-app/src/app/modules/tool-development/components/app-detail-config/components/app-detail-config-output/app-detail-config-output.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ConfigInputEditModel, ConfigOutputEditModel} from "@shared-lib/modules/app-execution/model/config";
import {MatIcon} from "@angular/material/icon";


interface WorkflowConnectorDetailData{
  inputConfig?: ConfigInputEditModel;
  outputConfig?: ConfigOutputEditModel;
}
@Component({
  selector: 'lib-workflow-connector-detail',
  imports: [
    AppDetailConfigInputComponent,
    AppDetailConfigOutputComponent,
    MatIcon
  ],
  templateUrl: './workflow-connector-detail.component.html',
  styleUrl: './workflow-connector-detail.component.scss'
})
export class WorkflowConnectorDetailComponent {
  readonly dialogRef = inject(MatDialogRef<WorkflowConnectorDetailComponent>);
  readonly data = inject<WorkflowConnectorDetailData>(MAT_DIALOG_DATA);

  get bothSet(){
    return !!this.data.inputConfig && !!this.data.outputConfig;
  }
  get inputConfig() {
    return [this.data.inputConfig!];
  }
  get outputConfig() {
    return [this.data.outputConfig!];
  }
}

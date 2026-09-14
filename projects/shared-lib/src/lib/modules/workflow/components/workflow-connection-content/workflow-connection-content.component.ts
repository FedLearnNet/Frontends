import {ChangeDetectionStrategy, Component, computed, inject, input, model} from '@angular/core';
import {WorkflowConnectionDTO, WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {FFlowModule} from "@foblex/flow";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {
  WorkflowConnectorDetailComponent
} from "@shared-lib/modules/workflow/components/workflow-connector-detail/workflow-connector-detail.component";
import {MatDialog} from "@angular/material/dialog";
import {ConfigInputEditModel, ConfigOutputEditModel} from "@shared-lib/modules/app-execution/model/config";
import {WorkflowHelperService} from "@shared-lib/modules/workflow/service/workflow.helper";

@Component({
  selector: 'lib-workflow-connection-content',
  imports: [
    FFlowModule,
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './workflow-connection-content.component.html',
  styleUrl: './workflow-connection-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowConnectionContentComponent {
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _workflowHelper: WorkflowHelperService = inject(WorkflowHelperService);

  workflow = model.required<WorkflowDTO>();
  connection = input.required<WorkflowConnectionDTO>();


  data = computed(() => {
    const con = this.connection();
    let inputId = con.inputId;
    let outputId = con.outputId;
    if (!this._workflowHelper.isInput(inputId)) {
      inputId = con.outputId;
      outputId = con.inputId;
    }
    return {
      inputConfig: this.getInputConfig(inputId),
      outputConfig: this.getOutputConfig(outputId),
    }
  })


  getInputConfig(inputId: string): ConfigInputEditModel | undefined {
    const inputNode = this._workflowHelper.getNodeId(inputId);
    const inputName = this._workflowHelper.getConfigName(inputId);
    const node = this.findNode(inputNode);
    if (node) {
      return node.appDetail?.appConfig.input.find(i => i.name === inputName);
    }
    return undefined;
  }

  getOutputConfig(outputId: string): ConfigOutputEditModel | undefined {
    const outputNode = this._workflowHelper.getNodeId(outputId);
    const outputName = this._workflowHelper.getConfigName(outputId);
    const node = this.findNode(outputNode);
    if (node) {
      return node.appDetail?.appConfig?.output.find(i => i.name === outputName);
    }
    return undefined;
  }


  findNode(nodeId: string) {
    return this.workflow().nodes.find(n => n.nodeId === nodeId);
  }

  openDialog(): void {
    this._dialog.open(WorkflowConnectorDetailComponent, {
      autoFocus: false,
      data: this.data()
    });
  }

}

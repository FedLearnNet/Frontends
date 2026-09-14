import {Component, computed, inject, model} from '@angular/core';
import {FFlowModule} from "@foblex/flow";
import {MatIcon} from "@angular/material/icon";
import {WorkflowHelperService} from "@shared-lib/modules/workflow/service/workflow.helper";
import {ConnectorIds} from "@shared-lib/modules/workflow/models/workflow-connectors";
import {WorkflowDTO, WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {MatDialog} from "@angular/material/dialog";
import {
  WorkflowConnectorDetailComponent
} from "@shared-lib/modules/workflow/components/workflow-connector-detail/workflow-connector-detail.component";
import {WorkflowService} from "@shared-lib/modules/workflow/service/workflow.service";


@Component({
  selector: 'lib-workflow-node-connectors',
  imports: [
    FFlowModule,
    MatIcon,
  ],
  templateUrl: './workflow-node-connectors.component.html',
  styleUrls: ['./workflow-node-connectors.component.scss']
})
export class WorkflowNodeConnectorsComponent {
  private readonly _workflowService = inject(WorkflowService);
  private readonly _workflowHelper: WorkflowHelperService = inject(WorkflowHelperService);
  private readonly _dialog: MatDialog = inject(MatDialog);

  node = model.required<WorkflowNodeDetailDTO>();
  workflow = model.required<WorkflowDTO>();
  inputMode = model<boolean>(false);

  config = computed(() => {
    const node = this.node();
    if (node.modelDetail) {
      const config = node.modelDetail.federatedApp?.appConfig;
      if(config) {
        return config;
      }
      //if loaded from db this one will be true
      if (node.appDetail) {
        return node.appDetail?.appConfig;
      }
    } else if (node.appDetail) {
      return node.appDetail?.appConfig;
    }
    return undefined;
  })

  extended = computed(() => this.node().extended || false);

  readonly connectorIds = computed<ConnectorIds[]>(() => {
    const node = this.node();
    const config = this.config();
    const nodeId = node.nodeId;
    return this._workflowHelper.getConnectorIds(nodeId, config);
  });

  getInputType(i: number) {
    const inputs = this.config()?.input ?? [];
    return inputs[i]?.type?.trim();
  }

  getOutputType(i: number) {
    const outputs = this.config()?.output ?? [];
    return outputs[i]?.type?.trim();
  }

  getInputName(i: number) {
    const inputs = this.config()?.input ?? [];
    return inputs[i]?.name?.trim();
  }

  getOutputName(i: number) {
    const outputs = this.config()?.output ?? [];
    return outputs[i]?.name?.trim();
  }

  openInputDialogOrDelete(i: number, event?: any): void {
    if (event) event.stopPropagation();
    const index = this.connectedInputIndex(i);
    if (index > -1) {
      this.deleteConnection(index);
      return;
    }
    this.openInputDialog(i);
  }

  openOutputDialogOrDelete(i: number, event?: any): void {
    if (event) event.stopPropagation();
    const index = this.connectedOutputIndex(i);
    if (index > -1) {
      this.deleteConnection(index);
      return;
    }
    this.openOutputDialog(i);
  }

  openInputDialog(i: number): void {
    const inputs = this.config()?.input ?? [];
    const input = inputs[i];
    if (input) {
      this.openDialog({inputConfig: input});
    }
  }

  openOutputDialog(i: number): void {
    const outputs = this.config()?.output ?? [];
    const output = outputs[i];
    if (output) {
      this.openDialog({outputConfig: output});
    }
  }

  openDialog(data: any): void {
    this._dialog.open(WorkflowConnectorDetailComponent, {
      autoFocus: false,
      data: data
    });
  }

  private connectedInputIndex(i: number) {
    const id = this.connectorIds()[i].inputId;
    return this.workflow().connections.findIndex(c => c.inputId === id);
  }

  private connectedOutputIndex(i: number) {
    const id = this.connectorIds()[i].outputId;
    return this.workflow().connections.findIndex(c => c.outputId === id);
  }

  private deleteConnection(i: number) {
    this.workflow.update(w => this._workflowService.removeConnectionByIndex(w, i));
  }
}

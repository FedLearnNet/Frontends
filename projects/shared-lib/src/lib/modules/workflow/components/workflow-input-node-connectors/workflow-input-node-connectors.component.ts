import {Component, computed, inject, model} from '@angular/core';
import {FFlowModule} from "@foblex/flow";
import {MatIcon} from "@angular/material/icon";
import {ConnectorIds} from "@shared-lib/modules/workflow/models/workflow-connectors";
import {WorkflowDTO, WorkflowInputDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {MatDialog} from "@angular/material/dialog";
import {
  WorkflowConnectorDetailComponent
} from "@shared-lib/modules/workflow/components/workflow-connector-detail/workflow-connector-detail.component";
import {WorkflowService} from "@shared-lib/modules/workflow/service/workflow.service";
import {INPUT_NODE_START} from "@shared-lib/modules/workflow/models/workflow-statics";


@Component({
  selector: 'lib-workflow-input-node-connectors',
  imports: [
    FFlowModule,
    MatIcon,
  ],
  templateUrl: './workflow-input-node-connectors.component.html',
  styleUrls: ['./workflow-input-node-connectors.component.scss']
})
export class WorkflowInputNodeConnectorsComponent {
  private readonly _workflowService = inject(WorkflowService);
  private readonly _dialog: MatDialog = inject(MatDialog);

  inputNode = model.required<WorkflowInputDTO>();
  workflow = model.required<WorkflowDTO>();
  inputMode = model<boolean>(false);


  readonly connectorId = computed<ConnectorIds>(() => {
    const node = this.inputNode();
    const nodeId = node.nodeId;
    return {
      outputId: INPUT_NODE_START + nodeId,
    }
  });


  getOutputType() {
    return this.inputNode()?.type?.trim();
  }

  openOutputDialogOrDelete(event?: any): void {
    if (event) event.stopPropagation();
    const index = this.connectedOutputIndex();
    if (index > -1) {
      this.deleteConnection(index);
      return;
    }
    this.openDialog();
  }


  openDialog(): void {
    this._dialog.open(WorkflowConnectorDetailComponent, {
      autoFocus: false,
      data: this.inputNode()
    });
  }

  private connectedOutputIndex() {
    const id = this.connectorId().outputId;
    return this.workflow().connections.findIndex(c => c.outputId === id);
  }

  private deleteConnection(i: number) {
    this.workflow.update(w => this._workflowService.removeConnectionByIndex(w, i));
  }
}

import {inject, Injectable} from "@angular/core";
import {WorkflowHelperService} from "@shared-lib/modules/workflow/service/workflow.helper";
import {ConnectorIds} from "@shared-lib/modules/workflow/models/workflow-connectors";
import {FMoveNodesEvent, FReassignConnectionEvent} from "@foblex/flow";
import {generateGuid} from "@foblex/utils";
import {PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {
  WorkflowConnectionDTO,
  WorkflowDTO,
  WorkflowInputDTO,
  WorkflowNodeDetailDTO
} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {ToolConfigDataType, ToolConfigModeType} from "@shared-lib/modules/app-execution/dto/config";
import {INPUT_NODE_START} from "@shared-lib/modules/workflow/models/workflow-statics";
import {ToolGraphEdgeDTO} from "@shared-lib/modules/store/dto/tool-graph";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";


@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private readonly _workflowHelper: WorkflowHelperService = inject(WorkflowHelperService);

  public getEmptyWorkflowDTO(): WorkflowDTO {
    return {
      nodes: [],
      connections: [],
      publishStatus: PublishStatus.UNPUBLISHED
    } as any;
  }

  public addStoreResult(workflow: WorkflowDTO, storeResult: StoreSelectDialogResult) {
    let x = 0;
    let y = 0;
    for (const node of workflow.nodes) {
      if (!node.position) continue;
      if (y <= node.position.y) {
        y = node.position.y;
      }
      x += node.position.x;
    }
    const l = workflow.nodes.length ? workflow.nodes.length : 1;
    x = x / l;
    y += 200;
    let app = storeResult.app;
    if (storeResult.model) {
      app = storeResult.model!.federatedApp;
    }
    const newNode = {
      nodeId: generateGuid(),
      position: {x: x, y: y},
      modelDetail: storeResult.model,
      modelSubId: storeResult.model?.lastVersion?.selectedSubModel?.id,
      appDetail: storeResult.app,
      federatedAppId: app!.id,
      federatedAppVersionId: app!.latestVersionId,
      appVersion: app!.latestVersion,
      imageName: app!.imageName
    } as WorkflowNodeDetailDTO;

    return this.addNode(workflow, newNode);
  }

  public addInputs(workflow: WorkflowDTO) {
    let x = 0;
    const y = 0;
    for (const node of workflow.nodes) {
      if (!node.position) continue;
      x += node.position.x;
    }
    const l = workflow.nodes.length ? workflow.nodes.length : 1;
    x = x / l;
    const input = {
      position: {x: x, y: y},
      nodeId: generateGuid(),
      name: '',
      type: ToolConfigDataType.CSV,
      description: '',
      editMode: true,
      required: false,
      mode: ToolConfigModeType.TRAINING
    } as WorkflowInputDTO
    if (!workflow.inputs) {
      workflow.inputs = [];
    }
    workflow.inputs.push(input);
    return workflow;
  }

  public addFederatedInputDataset(workflow: WorkflowDTO): WorkflowDTO {
    if (!workflow.inputs) {
      workflow.inputs = [];
    }
    const input: WorkflowInputDTO = {
      position: {x: 0, y: 0},
      nodeId: generateGuid(),
      name: 'input-data',
      type: ToolConfigDataType.CSV,
      description: 'This dataset will be the data provided via the Data tab.',
      hasHeader: true,
      delimiter: ',',
      required: true,
      mode: ToolConfigModeType.TRAINING
    };
    workflow.inputs.push(input);
    return workflow;
  }

  public addNode(workflow: WorkflowDTO, node: WorkflowNodeDetailDTO): WorkflowDTO {
    workflow.nodes.push(node);
    return workflow;
  }

  public removeNodeIds(workflow: WorkflowDTO, fNodeIds: string[]): WorkflowDTO {
    for (const nodeId of fNodeIds) {
      const index = workflow.nodes.findIndex(n => n.nodeId === nodeId);
      if (index !== -1) {
        const node = workflow.nodes[index];
        workflow = this.removeNode(workflow, node);
      }
      const inputIndex = workflow.inputs.findIndex(n => n.nodeId === nodeId);
      if (inputIndex !== -1) {
        const node = workflow.inputs[inputIndex];
        workflow = this.removeInput(workflow, node);
      }
    }
    return workflow;
  }

  public removeNode(workflow: WorkflowDTO, node: WorkflowNodeDetailDTO): WorkflowDTO {
    const index = workflow.nodes.findIndex(n => n.id === node.id);
    if (index !== -1) {
      workflow.nodes.splice(index, 1);
    }
    let config = node.appDetail?.appConfig;
    if (node.modelDetail) {
      config = node.modelDetail.federatedApp?.appConfig;
    }
    const edges = this._workflowHelper.getConnectorIds(node.nodeId, config);
    return this.removeConnectionFromNode(workflow, edges);
  }

  public removeInput(workflow: WorkflowDTO, input: WorkflowInputDTO): WorkflowDTO {
    const index = workflow.inputs.findIndex(n => n.nodeId === input.nodeId);
    if (index !== -1) {
      workflow.inputs.splice(index, 1);
    }
    const edges = [{
      outputId: INPUT_NODE_START + input.nodeId,
    }];
    return this.removeConnectionFromNode(workflow, edges);
  }

  public updateNode(workflow: WorkflowDTO, node: WorkflowNodeDetailDTO): WorkflowDTO {
    const index = workflow.nodes.findIndex(n => n.nodeId === node.nodeId);
    if (index !== -1) {
      workflow.nodes[index] = node;
    }
    return workflow;
  }

  public updateInputNode(workflow: WorkflowDTO, node: WorkflowInputDTO): WorkflowDTO {
    const index = workflow.inputs.findIndex(n => n.nodeId === node.nodeId);
    if (index !== -1) {
      workflow.inputs[index] = node;
    }
    return workflow;
  }


  public createConnection(workflow: WorkflowDTO, outputId: string, inputId: string): WorkflowDTO {
    return this.pushConnection(workflow, this.createConnectionDTO(outputId, inputId));
  }

  public removeConnectionByEvent(workflow: WorkflowDTO, event: FReassignConnectionEvent): WorkflowDTO {
    return this.removeConnection(workflow, event.oldSourceId, event.oldTargetId);
  }

  public reassignConnection(workflow: WorkflowDTO, event: FReassignConnectionEvent): WorkflowDTO {
    workflow = this.removeConnectionByEvent(workflow, event);
    return this.pushConnection(workflow, this.createConnectionDTO(event.oldSourceId, event.newTargetId!));
  }

  public addGraphEdges(workflow: WorkflowDTO, edges: ToolGraphEdgeDTO[], apps: AppDetailDto[]): WorkflowDTO {
    workflow.nodes = workflow.nodes ?? [];
    workflow.inputs = workflow.inputs ?? [];
    workflow.connections = workflow.connections ?? [];

    const existingAppIds = new Set<number>(
      (workflow.nodes ?? [])
        .map(n => n.appDetail?.id)
        .filter(id => id !== undefined)
    );

    for (const app of (apps ?? [])) {
      if (!app?.id) continue;
      if (existingAppIds.has(app.id)) continue;
      workflow = this.addStoreResult(workflow, {app} as StoreSelectDialogResult);
      existingAppIds.add(app.id);
    }

    const nodeByAppId = new Map<number, WorkflowNodeDetailDTO>();
    for (const n of (workflow.nodes)) {
      const aid = n.appDetail?.id;
      if (!aid) {
        continue;
      }
      nodeByAppId.set(aid, n as WorkflowNodeDetailDTO);
    }

    for (const edge of (edges ?? [])) {
      const fromNode = nodeByAppId.get(edge.fromAppId);
      const toNode = nodeByAppId.get(edge.toAppId);
      if (!fromNode || !toNode) continue;

      for (const match of (edge.matches ?? [])) {
        const outputId = this._workflowHelper.getConnectorOutputIdByName(fromNode.nodeId, match.outputVariable);
        const inputId = this._workflowHelper.getConnectorInputIdByName(toNode.nodeId, match.inputVariable);
        if (!outputId || !inputId) continue;

        if (this.hasExactConnection(workflow, outputId, inputId)) continue;

        workflow = this.createConnection(workflow, outputId, inputId);
      }

    }

    return workflow;
  }

  private hasExactConnection(workflow: WorkflowDTO, outputId: string, inputId: string) {
    return (workflow.connections ?? []).some(c => c.outputId === outputId || c.inputId === inputId);
  }

  private createConnectionDTO(outputId: string, inputId: string): WorkflowConnectionDTO {
    if (outputId.startsWith("INPUT_NODE_")) {
      return {
        outputId: outputId,
        inputId: inputId,
        inputConnection: true,
        inputNodeId: this._workflowHelper.getNodeId(inputId),
        inputConfigName: this._workflowHelper.getConfigName(inputId),
      } as WorkflowConnectionDTO;
    }
    return {
      outputId: outputId,
      inputId: inputId,
      inputConnection: false,
      outputNodeId: this._workflowHelper.getNodeId(outputId),
      inputNodeId: this._workflowHelper.getNodeId(inputId),
      outputConfigName: this._workflowHelper.getConfigName(outputId),
      inputConfigName: this._workflowHelper.getConfigName(inputId),
    } as WorkflowConnectionDTO;
  }

  public deleteConnections(workflow: WorkflowDTO): WorkflowDTO {
    workflow.connections = [];
    return workflow;
  }

  public removeConnectionFromNode(workflow: WorkflowDTO, connectorIds: ConnectorIds[]): WorkflowDTO {
    //keep the edges which are not effected, remove only the one which are given via connectorIds
    workflow.connections = workflow.connections ?? [];
    const inputIds = connectorIds.filter(f => f.inputId).map(f => f.inputId);
    const outputIds = connectorIds.filter(f => f.outputId).map(f => f.outputId);
    workflow.connections = workflow.connections.filter(c => {
      if (outputIds.indexOf(c.outputId) !== -1) {
        return false;
      }
      if (inputIds.indexOf(c.inputId) !== -1) {
        return false;
      }
      return true;
    });
    return workflow;
  }

  public removeConnectionByIndex(workflow: WorkflowDTO, connectionIndex: number): WorkflowDTO {
    if (connectionIndex === -1) {
      throw new Error('Connection not found');
    }
    workflow.connections.splice(connectionIndex, 1);
    return workflow;
  }

  public removeConnection(workflow: WorkflowDTO, outputId: string, inputId: string): WorkflowDTO {
    const connectionIndex = this.findConnectionIndex(workflow, outputId, inputId);
    if (connectionIndex === -1) {
      throw new Error('Connection not found');
    }
    workflow.connections.splice(connectionIndex, 1);
    return workflow;
  }

  public findConnectionIndex(workflow: WorkflowDTO, outputId: string, inputId: string): number {
    return workflow.connections.findIndex(x => x.outputId === outputId && x.inputId === inputId);
  }

  public pushConnection(workflow: WorkflowDTO, newCon: WorkflowConnectionDTO): WorkflowDTO {
    const nodeIdInput = this._workflowHelper.getNodeId(newCon.inputId);
    const nodeOutputIdInput = this._workflowHelper.getNodeId(newCon.outputId);
    if (nodeIdInput === nodeOutputIdInput) {
      return workflow;
    }
    if (!workflow.connections) {
      workflow.connections = workflow.connections ?? [];
    }
    workflow.connections.push(newCon);
    return workflow;
  }

  public updateNodeMovement(workflow: WorkflowDTO, event: FMoveNodesEvent): WorkflowDTO {
    event.fNodes.forEach(fNode => {
      const index = workflow.nodes.findIndex(n => n.nodeId === fNode.id);
      if (index !== -1) {
        workflow.nodes[index] = {
          ...workflow.nodes[index],
          position: fNode.position
        };
      }
    })
    return workflow;
  }
}

import {Injectable} from "@angular/core";
import {ToolConfigsDTO, ToolInputConfigDTO, ToolOutputConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {ConnectorIds} from "@shared-lib/modules/workflow/models/workflow-connectors";
import {APP_NODE_START} from "@shared-lib/modules/workflow/models/workflow-statics";


@Injectable({
  providedIn: 'root'
})
export class WorkflowHelperService {

  public getConnectorIds(nodeId: string, appConfig?: ToolConfigsDTO): ConnectorIds[] {

    const inputs = appConfig?.input ?? [];
    const outputs = appConfig?.output ?? [];

    const max = Math.max(inputs.length, outputs.length);
    const result: ConnectorIds[] = [];

    for (let i = 0; i < max; i++) {
      const inputId = this.getConnectorInputId(nodeId, inputs[i]);
      const outputId = this.getConnectorOutputId(nodeId, outputs[i]);
      const item: ConnectorIds = {};

      if (inputId) item.inputId = inputId;
      if (outputId) item.outputId = outputId;

      result.push(item);
    }

    return result;
  }

  public getConnectorInputId(nodeId: string, input?: ToolInputConfigDTO): string | undefined {
    const name = input?.name?.trim();
    return this.getConnectorInputIdByName(nodeId, name);
  }

  public getConnectorOutputId(nodeId: string, output?: ToolOutputConfigDTO): string | undefined {
    const name = output?.name?.trim();
    return this.getConnectorOutputIdByName(nodeId, name);
  }

  public getConnectorInputIdByName(nodeId: string, name?: string): string | undefined {
    if (name === undefined) {
      return undefined;
    }
    return this.getConnectorId(nodeId, "input", name);
  }

  public getConnectorOutputIdByName(nodeId: string, name?: string): string | undefined {
    if (name === undefined) {
      return undefined;
    }
    return this.getConnectorId(nodeId, "output", name);
  }

  private getConnectorId(nodeId: string, prefix: string, name: string): string {
    return `${APP_NODE_START}${nodeId}_${prefix}_${name}`
  }

  public getNodeId(id: string) {
    const parts = id.split('_');
    if (parts.length >= 2) {
      return parts[1];
    }
    return '';
  }

  public getConfigName(id: string) {
    const parts = id.split('_');
    if (parts.length >= 4) {
      return parts.slice(3).join('_');
    }
    return '';
  }

  public isInput(id: string) {
    return id.includes("input");
  }

}

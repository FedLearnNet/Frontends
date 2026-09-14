import {inject, Injectable} from '@angular/core';
import {WorkflowDTO, WorkflowInputDTO, WorkflowNodeDetailDTO} from '@shared-lib/modules/workflow/dto/workflow.dto';
import {ToolConfigDataType, ToolConfigsDTO} from '@shared-lib/modules/app-execution/dto/config';
import {INPUT_NODE_START} from '@shared-lib/modules/workflow/models/workflow-statics';
import {HyperParamValidationService} from '@shared-lib/modules/app-execution/service/hyper-param-validation.service';

export type WorkflowValidationErrorCode =
  | 'WORKFLOW.EMPTY'
  | 'WORKFLOW.INPUTS.MISSING'
  | 'WORKFLOW.NODES.MISSING'
  | 'WORKFLOW.CONNECTIONS.INVALID'
  | 'INPUT.NAME.MISSING'
  | 'INPUT.MODE.MISSING'
  | 'INPUT.TYPE.MISSING'
  // | 'INPUT.DESCRIPTION.MISSING' Not yet req.
  | 'INPUT.CSV.HEADER.MISSING'
  | 'INPUT.CSV.DELIMITER.MISSING'
  | 'NODE.ID.MISSING'
  | 'NODE.APP_CONFIG.MISSING'
  | 'NODE.HYPERPARAMS.INVALID'
  | 'NODE.REQUIRED_INPUT.NOT_CONNECTED'
  | 'CONNECTION.NODE.NOT_FOUND'
  | 'CONNECTION.CONFIG.NOT_FOUND'
  | 'CONNECTION.DUPLICATE';

export interface WorkflowValidationError {
  code: WorkflowValidationErrorCode;
  path: string;
  message: string;
  meta?: Record<string, unknown>;
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: WorkflowValidationError[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowValidationService {
  protected readonly hyperParamValidationService: HyperParamValidationService = inject(HyperParamValidationService);

  public validate(workflow: WorkflowDTO | null | undefined): WorkflowValidationResult {
    const errors: WorkflowValidationError[] = [];

    if (!workflow) {
      errors.push(this.err('WORKFLOW.EMPTY', 'workflow', 'Workflow is missing.'));
      return {valid: false, errors};
    }

    errors.push(...this.validateNodes(workflow.nodes));
    errors.push(...this.validateInputs(workflow));
    errors.push(...this.validateConnections(workflow));

    return {valid: errors.length === 0, errors};
  }

  private validateInputs(workflow: WorkflowDTO): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];
    const inputs = workflow.inputs ?? [];
    const nodes = workflow.nodes ?? [];

    inputs.forEach((input, i) => {
      errors.push(...this.validateInput(input, `inputs[${i}]`));
    });

    if (inputs.length === 0) {
      const hasStartNode = nodes.some(node => this.isStartNode(node));

      if (!hasStartNode) {
        errors.push(
          this.err(
            'WORKFLOW.INPUTS.MISSING',
            'inputs',
            'At least one workflow input is required unless there is a node that can start without incoming inputs.'
          )
        );
      }
    }

    return errors;
  }

  private validateInput(input: WorkflowInputDTO | null | undefined, path: string): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    if (!input) {
      errors.push(this.err('WORKFLOW.INPUTS.MISSING', path, 'Input is missing.'));
      return errors;
    }

    if (this.isBlank(input.name)) {
      errors.push(this.err('INPUT.NAME.MISSING', `${path}.name`, 'Input name is required.'));
    }

    if (!input.mode) {
      errors.push(this.err('INPUT.MODE.MISSING', `${path}.mode`, 'Input mode is required.'));
    }

    if (!input.type) {
      errors.push(this.err('INPUT.TYPE.MISSING', `${path}.type`, 'Input type is required.'));
    }

    if (input.type === ToolConfigDataType.CSV) {
      if (input.hasHeader === undefined || input.hasHeader === null) {
        errors.push(this.err('INPUT.CSV.HEADER.MISSING', `${path}.hasHeader`, 'CSV header flag (hasHeader) must be set.'));
      }

      if (this.isBlank(input.delimiter)) {
        errors.push(this.err('INPUT.CSV.DELIMITER.MISSING', `${path}.delimiter`, 'CSV delimiter must be set.'));
      }
    }

    return errors;
  }

  private validateNodes(nodes: WorkflowDTO['nodes'] | null | undefined): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];

    if (!nodes || nodes.length === 0) {
      errors.push(this.err('WORKFLOW.NODES.MISSING', 'nodes', 'At least one node must be present in the workflow.'));
      return errors;
    }

    nodes.forEach((node, i) => {
      const nodePath = `nodes[${i}]`;

      if (!node?.nodeId || this.isBlank(String(node.nodeId))) {
        errors.push(this.err('NODE.ID.MISSING', `${nodePath}.nodeId`, 'Node nodeId is required.'));
      }
    });

    return errors;
  }

  private validateConnections(workflow: WorkflowDTO): WorkflowValidationError[] {
    const errors: WorkflowValidationError[] = [];
    const nodes = workflow.nodes ?? [];
    const connections = workflow.connections ?? [];

    const nodeById = new Map(
      nodes
        .filter((n): n is WorkflowNodeDetailDTO => !!n?.nodeId)
        .map(n => [String(n.nodeId), n] as const)
    );

    const seen = new Set<string>();

    connections.forEach((c, i) => {
      const path = `connections[${i}]`;

      const inNode = c?.inputNodeId ? nodeById.get(String(c.inputNodeId)) : undefined;
      const outNode = c?.outputNodeId ? nodeById.get(String(c.outputNodeId)) : undefined;
      const isWorkflowInputConnection = !!c?.outputId?.startsWith(INPUT_NODE_START);

      if (!inNode) {
        errors.push(
          this.err(
            'CONNECTION.NODE.NOT_FOUND',
            `${path}.inputNodeId`,
            'Input node referenced by this connection does not exist.',
            {inputNodeId: c?.inputNodeId}
          )
        );
      }

      if (!outNode && !isWorkflowInputConnection) {
        errors.push(
          this.err(
            'CONNECTION.NODE.NOT_FOUND',
            `${path}.outputNodeId`,
            'Output node referenced by this connection does not exist.',
            {outputNodeId: c?.outputNodeId}
          )
        );
      }

      const dedupeKey = [
        c?.inputNodeId,
        c?.inputConfigName,
        c?.outputNodeId,
        c?.outputConfigName,
        c?.outputId
      ]
        .map(v => String(v ?? ''))
        .join('|');

      if (dedupeKey !== '||||') {
        if (seen.has(dedupeKey)) {
          errors.push(
            this.err(
              'CONNECTION.DUPLICATE',
              path,
              'Duplicate connection detected (same input/output pairing).',
              {key: dedupeKey}
            )
          );
        } else {
          seen.add(dedupeKey);
        }
      }

      if (inNode) {
        const inputCfgNames = this.getNodeInputConfigNames(inNode);
        if (c?.inputConfigName && !inputCfgNames.has(c.inputConfigName)) {
          errors.push(
            this.err(
              'CONNECTION.CONFIG.NOT_FOUND',
              `${path}.inputConfigName`,
              'Input config referenced by this connection does not exist on the input node.',
              {nodeId: inNode.nodeId, inputConfigName: c.inputConfigName}
            )
          );
        }
      }

      if (outNode) {
        const outputCfgNames = this.getNodeOutputConfigNames(outNode);
        if (c?.outputConfigName && !outputCfgNames.has(c.outputConfigName)) {
          errors.push(
            this.err(
              'CONNECTION.CONFIG.NOT_FOUND',
              `${path}.outputConfigName`,
              'Output config referenced by this connection does not exist on the output node.',
              {nodeId: outNode.nodeId, outputConfigName: c.outputConfigName}
            )
          );
        }
      }
    });

    nodes.forEach(node => {
      if (!node?.nodeId) {
        return;
      }

      const cfg = this.getNodeToolConfig(node);
      if (!cfg) {
        errors.push(
          this.err(
            'NODE.APP_CONFIG.MISSING',
            `nodes[nodeId=${node.nodeId}]`,
            'Node has no tool configuration.',
            {nodeId: node.nodeId}
          )
        );
        return;
      }

      if (!this.checkHyperParam(cfg, node)) {
        errors.push(
          this.err(
            'NODE.HYPERPARAMS.INVALID',
            `nodes[nodeId=${node.nodeId}].hyperParams`,
            'Node contains invalid hyperparameter values.',
            {nodeId: node.nodeId}
          )
        );
        return;
      }

      const requiredInputs = (cfg.input ?? []).filter(i => i?.required);
      if (requiredInputs.length === 0) {
        return;
      }

      for (const input of requiredInputs) {
        const inputName = input?.name;
        if (!inputName) {
          continue;
        }

        const isConnected = connections.some(c =>
          String(c?.inputNodeId ?? '') === String(node.nodeId) &&
          String(c?.inputConfigName ?? '') === String(inputName)
        );

        if (!isConnected) {
          errors.push(
            this.err(
              'NODE.REQUIRED_INPUT.NOT_CONNECTED',
              `nodes[nodeId=${node.nodeId}].input[name=${inputName}]`,
              `Required input '${inputName}' is not connected.`,
              {nodeId: node.nodeId, inputName}
            )
          );
        }
      }
    });

    return errors;
  }

  private isStartNode(node: WorkflowNodeDetailDTO | null | undefined): boolean {
    if (!node?.nodeId) {
      return false;
    }

    const cfg = this.getNodeToolConfig(node);
    if (!cfg) {
      return false;
    }

    const requiredInputs = (cfg.input ?? []).filter(i => i?.required);
    return requiredInputs.length === 0;
  }

  private getNodeToolConfig(node: WorkflowNodeDetailDTO): ToolConfigsDTO | undefined {
    return node.appDetail?.appConfig;
  }

  private checkHyperParam(config: ToolConfigsDTO, node: WorkflowNodeDetailDTO): boolean {
    return this.hyperParamValidationService.validateHyperParamValues(config.hyperparams, node.hyperParams);
  }

  private getNodeInputConfigNames(node: WorkflowDTO['nodes'][number]): Set<string> {
    const cfg = this.getNodeToolConfig(node);
    return new Set((cfg?.input ?? []).map(i => String(i?.name ?? '')).filter(Boolean));
  }

  private getNodeOutputConfigNames(node: WorkflowDTO['nodes'][number]): Set<string> {
    const cfg = this.getNodeToolConfig(node);
    return new Set((cfg?.output ?? []).map(o => String(o?.name ?? '')).filter(Boolean));
  }

  private err(
    code: WorkflowValidationErrorCode,
    path: string,
    message: string,
    meta?: Record<string, unknown>
  ): WorkflowValidationError {
    return {code, path, message, meta};
  }

  private isBlank(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
  }
}

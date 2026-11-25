import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";

export type ExternalDatabaseType = 'NEO4J' | 'POSTGRES' | 'MYSQL' | 'MONGODB' | 'OTHER';
export type ExternalDatabaseAccess = 'DIRECT' | 'TOOL';

export interface TreSourceDto {
  id: string;
  name: string;
  description?: string;
  type?: ExternalDatabaseType;
  access?: ExternalDatabaseAccess;
  toolVersionId?: number;
  toolName?: string;
  // set by the client, the project cannot change them
  hyperParams?: Record<string, unknown>;
  // synthetic test data of the client: a script, a link or how to get it
  testData?: string;
  // a dump or file of synthetic records, downloadable with its secret
  testDataFile?: TreTestDataFileDto;
}

export interface TreTestDataFileDto {
  id: number;
  fileName: string;
  size: number;
  secret: string;
}

// A TRE runs without relay, so no federated tools; an external database may allow only one tool.
export function treWorkflowErrors(workflow: WorkflowDTO | undefined, source?: TreSourceDto): string[] {
  return (workflow?.nodes ?? []).flatMap(node => {
    const name = node.appDetail?.name ?? node.nodeId;
    const errors: string[] = [];
    if (node.supportsFederatedLearning || node.appDetail?.supportsFederatedLearning) {
      errors.push(`${name} is a federated tool, it can not run in a TRE`);
    }
    if (source?.access === 'TOOL' && node.federatedAppVersionId !== source.toolVersionId) {
      errors.push(`Only ${source.toolName} may run on ${source.name}`);
    }
    return errors;
  });
}

// The client's hyper parameters win over the project's.
export function withTreHyperParams(workflow: WorkflowDTO, source?: TreSourceDto): WorkflowDTO {
  if (source?.access !== 'TOOL' || !source.hyperParams) {
    return workflow;
  }
  return {
    ...workflow,
    nodes: workflow.nodes.map(node => node.federatedAppVersionId === source.toolVersionId
      ? {...node, hyperParams: {...node.hyperParams, ...source.hyperParams}} : node),
  };
}

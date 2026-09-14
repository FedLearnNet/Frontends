import {Injectable} from "@angular/core";
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";


@Injectable({
  providedIn: 'root'
})
export class WorkflowTrainingHelperService {

  containsTrainableApps(workflow: WorkflowDTO | null | undefined): number {
    if (!workflow) {
      return 0;
    }
    const nodes = workflow.nodes;
    if (nodes.length === 0) {
      return 0;
    }
    return nodes.filter(n => n.appDetail !== undefined)
      .map(node => node.appDetail)
      .filter(app => app?.type === FederatedAppType.ANALYSIS)
      .length;
  }
}

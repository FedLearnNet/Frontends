import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import {
  EFMarkerType,
  FBackgroundComponent,
  FCanvasComponent,
  FCirclePatternComponent,
  FConnectionContent,
  FFlowComponent,
  FFlowModule,
  FZoomDirective
} from "@foblex/flow";
import {
  WorkflowConnectionContentComponent
} from "@shared-lib/modules/workflow/components/workflow-connection-content/workflow-connection-content.component";
import {
  WorkflowNodeConnectorsComponent
} from "@shared-lib/modules/workflow/components/workflow-node-connectors/workflow-node-connectors.component";
import {WorkflowDTO, WorkflowNodeDetailDTO, WorkflowNodeDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  ExperimentWorkflowNodeCardComponent
} from "@shared-lib/modules/experiments/components/experiment-workflow-node-card/experiment-workflow-node-card.component";
import {BaseWorkflowExperimentDTO, BaseWorkflowStepDTO} from "@shared-lib/modules/experiments/dto/experiments";
import {WorkflowService} from "@shared-lib/modules/workflow/service/workflow.service";
import {
  WorkflowInputCardComponent
} from "@shared-lib/modules/workflow/components/workflow-input-card/workflow-input-card.component";
import {
  WorkflowInputNodeConnectorsComponent
} from "@shared-lib/modules/workflow/components/workflow-input-node-connectors/workflow-input-node-connectors.component";

@Component({
  selector: 'lib-workflow-readonly-view',
  imports: [
    FBackgroundComponent,
    FCanvasComponent,
    FCirclePatternComponent,
    FConnectionContent,
    FFlowComponent,
    FFlowModule,
    FZoomDirective,
    WorkflowConnectionContentComponent,
    WorkflowNodeConnectorsComponent,
    ExperimentWorkflowNodeCardComponent,
    WorkflowInputCardComponent,
    WorkflowInputNodeConnectorsComponent
  ],
  templateUrl: './workflow-readonly-view.component.html',
  styleUrl: './workflow-readonly-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowReadonlyViewComponent {
  private readonly _workflowService = inject(WorkflowService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  workflow = input.required<WorkflowDTO>();
  updatePosition = input<boolean>(false);
  selectNode = output<WorkflowNodeDetailDTO>();
  experiment = input<BaseWorkflowExperimentDTO>();
  private readonly _canvas = viewChild.required(FCanvasComponent);
  public eMarkerType = EFMarkerType;


  nodes = computed(() => {
    const workflow = this.workflow();
    if (!this.updatePosition()) {
      return workflow.nodes;
    }
    return workflow.nodes
      .filter(n => this.hasStepNode(n))
      .map((node) => {
        const y = Math.max(10, 300 * ((node.executionOrder ?? 0) + 1));
        return {
          ...node,
          position: {
            ...node.position,
            x: 0,
            y,
          },
        } as WorkflowNodeDetailDTO;
      });
  })

  selectedNode = signal<WorkflowNodeDetailDTO | undefined>(undefined);

  public onLoaded(): void {
    this._canvas().resetScaleAndCenter(false);
  }

  public getStepForNode(node: WorkflowNodeDTO) {
    if (!this.experiment()) {
      return undefined;
    }
    return this.experiment()!.steps.find((step: BaseWorkflowStepDTO) => step.workflowNodeId === node.id);
  }

  public hasStepNode(node: WorkflowNodeDTO) {
    if (!this.experiment()) {
      return true;
    }
    return !!this.experiment()!.steps.find((step: BaseWorkflowStepDTO) => step.workflowNodeId === node.id);
  }

  toggleSelectedNode(node: WorkflowNodeDetailDTO): void {
    const selectedNode = this.selectedNode();
    if (selectedNode && selectedNode.id === node.id) {
      this.selectedNode.set(undefined);
    } else {
      this.selectedNode.set(node);
      this.selectNode.emit(node);
    }
  }

}

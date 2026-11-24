import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild
} from '@angular/core';
import {TreSourceDto, treWorkflowErrors, withTreHyperParams} from '@shared-lib/modules/workflow/dto/tre-source';
import {WorkflowValidationError} from '@shared-lib/modules/workflow/service/workflow-validation.service';
import {
  EFMarkerType,
  FCanvasComponent,
  FConnectionContent,
  FCreateConnectionEvent,
  FFlowComponent,
  FFlowModule,
  FMoveNodesEvent,
  FReassignConnectionEvent,
  FSelectionChangeEvent,
  FZoomDirective
} from "@foblex/flow";
import {
  WorkflowNodeCardComponent
} from "@shared-lib/modules/workflow/components/workflow-node-card/workflow-node-card.component";
import {
  WorkflowPaletteComponent
} from "@shared-lib/modules/workflow/components/workflow-palette/workflow-palette.component";
import {
  WorkflowNodeConnectorsComponent
} from "@shared-lib/modules/workflow/components/workflow-node-connectors/workflow-node-connectors.component";
import {
  WorkflowActionPanelComponent
} from "@shared-lib/modules/workflow/components/workflow-action-panel/workflow-action-panel.component";
import {WorkflowService} from "@shared-lib/modules/workflow/service/workflow.service";
import {FlowActionPanelAction} from "@shared-lib/modules/workflow/models/workflow-actions.model";
import {IPoint} from "@foblex/2d";
import {toSignal} from "@angular/core/rxjs-interop";
import {selectSelectedWorkflow, selectWorkflowLoading} from "@shared-lib/modules/workflow/store/workflow.selectors";
import {Store} from "@ngrx/store";
import {Actions} from "@ngrx/effects";
import {Observable} from "rxjs";
import {UnsavedChangesService} from "@shared-lib/services/unsaved-changes.service";
import {dispatchAndAwait} from "@shared-lib/utils/dispatch-and-await";
import * as WorkflowActions from '@shared-lib/modules/workflow/store/workflow.actions';
import {WorkflowDTO, WorkflowInputDTO, WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  WorkflowConnectionContentComponent
} from "@shared-lib/modules/workflow/components/workflow-connection-content/workflow-connection-content.component";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {
  WorkflowInputCardComponent
} from "@shared-lib/modules/workflow/components/workflow-input-card/workflow-input-card.component";
import {
  WorkflowInputNodeConnectorsComponent
} from "@shared-lib/modules/workflow/components/workflow-input-node-connectors/workflow-input-node-connectors.component";
import {
  WorkflowValidationPanelComponent
} from "@shared-lib/modules/workflow/components/workflow-validation-panel/workflow-validation-panel.component";
import {
  StoreGraphShortestPathDialogComponent
} from "@shared-lib/modules/store/components/store-graph-shortest-path-dialog/store-graph-shortest-path-dialog.component";
import {ShortestPathDialog} from "@shared-lib/modules/store/model/store-graph";
import {ToolGraphPathDTO} from "@shared-lib/modules/store/dto/tool-graph";
import {MatDialog} from "@angular/material/dialog";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {StoreService} from "@shared-lib/modules/store/store/store.service";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";

@Component({
  selector: 'lib-workflow-view',
  imports: [FFlowModule,
    FConnectionContent,
    FZoomDirective,
    WorkflowNodeCardComponent,
    WorkflowPaletteComponent,
    WorkflowNodeConnectorsComponent,
    WorkflowActionPanelComponent,
    WorkflowConnectionContentComponent,
    WorkflowInputCardComponent,
    WorkflowInputNodeConnectorsComponent,
    WorkflowValidationPanelComponent,
    EmptyStateComponent
  ],
  templateUrl: './workflow-view.component.html',
  styleUrl: './workflow-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowViewComponent {
  private readonly store: Store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly _workflowService = inject(WorkflowService);
  private readonly storeService: StoreService = inject(StoreService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  workflowId = input<number | undefined>();
  projectId = input<number | undefined>();
  isForFederatedLearning = input<boolean>(false);
  // external database of the project, it may allow only one tool with hyper parameters of the client
  treSource = input<TreSourceDto | undefined>();
  treErrors = computed<WorkflowValidationError[]>(() => this.treSource()
    ? treWorkflowErrors(this.workflow(), this.treSource()).map(message => ({code: 'TRE.TOOL', path: 'workflow', message}))
    : []);

  private readonly _canvas = viewChild.required(FCanvasComponent);
  private readonly _flow = viewChild.required(FFlowComponent);
  private readonly _zoom = viewChild(FZoomDirective);

  private readonly selectedWorkflow = toSignal(this.store.select(selectSelectedWorkflow), {initialValue: null});
  readonly loading = toSignal(this.store.select(selectWorkflowLoading), {initialValue: true});

  protected readonly selected = signal<string[]>([]);
  workflowValid = signal<boolean>(true);
  workflow = model<WorkflowDTO>(this._workflowService.getEmptyWorkflowDTO());

  selectionLength = computed(() => this.selected().length);

  noWorkflowFound = computed(() => {
    const loading = this.loading();
    const selectedWorkflow = this.selectedWorkflow();
    return (!loading && !selectedWorkflow);
  });

  public eMarkerType = EFMarkerType;

  private flowRendered = false;
  private lastCenteredWorkflowId: number | undefined;

  /** Serialized workflow as last loaded from / saved to the backend. */
  private readonly savedSnapshot = signal<string | null>(null);
  readonly hasUnsavedChanges = computed(() => {
    const snapshot = this.savedSnapshot();
    return snapshot !== null && this.signature(this.workflow()) !== snapshot;
  });

  private readonly unsavedChanges = inject(UnsavedChangesService).register({
    hasUnsavedChanges: () => this.hasUnsavedChanges(),
    save: () => this.saveWorkflow(),
  });

  constructor() {
    effect(() => {
      const dto = this.selectedWorkflow();
      if (dto) {
        const mutable = structuredClone(dto);
        if (this.isForFederatedLearning() && !mutable.inputs?.some(i => i.name === 'input-data')) {
          this._workflowService.addFederatedInputDataset(mutable);
        }
        this.workflow.set(mutable);
        this.savedSnapshot.set(this.signature(mutable));
        if (this.flowRendered && dto.id !== this.lastCenteredWorkflowId) {
          this._canvas()?.resetScaleAndCenter();
        }
        this.lastCenteredWorkflowId = dto.id;
      }
    });
    effect(() => {
      const id = this.workflowId();
      if (id) {
        this.store.dispatch(WorkflowActions.loadWorkflow({id}));
      }
    });
  }

  public startNewWorkflow() {
    this.store.dispatch(WorkflowActions.createWorkflow({createDTO: {projectId: this.projectId()}}));
  }

  protected changeSelection(event: FSelectionChangeEvent): void {
    this.selected.set(event.fNodeIds);
  }

  protected updateNodeMovement(event: FMoveNodesEvent): void {
    this.updateWorkflow(c => this._workflowService.updateNodeMovement(c, event));
  }

  public processAction(event: FlowActionPanelAction): void {
    switch (event) {
      case FlowActionPanelAction.RESET:
        this.workflow.set(this._workflowService.getEmptyWorkflowDTO());
        break;
      case FlowActionPanelAction.CONNECT_SELECTED:
        this.openConnectDialog();
        break;
      case FlowActionPanelAction.SAVE:
        this.saveWorkflow().subscribe();
        break;
      case FlowActionPanelAction.ZOOM_IN:
        this._zoom()?.zoomIn();
        break;
      case FlowActionPanelAction.ZOOM_OUT:
        this._zoom()?.zoomOut();
        break;
      case FlowActionPanelAction.FIT_TO_SCREEN:
        this._canvas()?.fitToScreen();
        break;
      case FlowActionPanelAction.ONE_TO_ONE:
        this._canvas()?.resetScaleAndCenter();
        break;
      case FlowActionPanelAction.DELETE_SELECTED: {
        let nodeIds = this.selected();
        if (this.isForFederatedLearning()) {
          const protectedId = this.workflow().inputs.find(i => i.name === 'input-data')?.nodeId;
          if (protectedId) {
            nodeIds = nodeIds.filter(id => id !== protectedId);
          }
        }
        this.updateWorkflow(c => this._workflowService.removeNodeIds(c, nodeIds));
        this.selected.set([]);
        break;
      }
    }
  }

  private signature(workflow: WorkflowDTO): string {
    const withoutPosition = <T extends { position?: unknown }>(items: T[] | undefined) =>
      items?.map(({position: _position, ...rest}) => rest);
    return JSON.stringify({
      ...workflow,
      nodes: withoutPosition(workflow.nodes),
      inputs: withoutPosition(workflow.inputs),
    });
  }

  private saveWorkflow(): Observable<boolean> {
    const dto = this.workflow();
    return dto.id
      ? dispatchAndAwait(this.store, this.actions$,
        WorkflowActions.updateWorkflow({id: dto.id, updateDTO: dto}),
        [WorkflowActions.updateWorkflowSuccess], [WorkflowActions.updateWorkflowFailure])
      : dispatchAndAwait(this.store, this.actions$,
        WorkflowActions.createWorkflow({createDTO: dto as any}),
        [WorkflowActions.createWorkflowSuccess], [WorkflowActions.createWorkflowFailure]);
  }

  public deleteInputNode(node: WorkflowInputDTO) {
    this.updateWorkflow(c => this._workflowService.removeInput(c, node));
    this.selected.set([]);
  }

  public deleteNode(node: WorkflowNodeDetailDTO) {
    this.updateWorkflow(c => this._workflowService.removeNode(c, node));
    this.selected.set([]);
  }

  public onConnectionCreated(event: FCreateConnectionEvent): void {
    if (event.fInputId) {
      this.updateWorkflow(c => this._workflowService.createConnection(c, event.fOutputId, event.fInputId!));
    }
  }

  public addNode(app: StoreSelectDialogResult) {
    this.updateWorkflow(c => this._workflowService.addStoreResult(c, app, this.newPosition(c)));
  }

  public addDataset() {
    this.updateWorkflow(c => this._workflowService.addInputs(c, this.newPosition(c)));
  }

  public updateNode(node: WorkflowNodeDetailDTO) {
    this.updateWorkflow(c => this._workflowService.updateNode(c, node));
  }

  public updateInputNode(node: WorkflowInputDTO) {
    this.updateWorkflow(c => this._workflowService.updateInputNode(c, node));
  }

  public onConnectionDropped(event: FReassignConnectionEvent): void {
    if (!event.newTargetId) {
      this.updateWorkflow(c => this._workflowService.removeConnectionByEvent(c, event));
    } else {
      this.updateWorkflow(c => this._workflowService.reassignConnection(c, event));
    }
  }

  private newPosition(workflow: WorkflowDTO): IPoint {
    const view = this.host.nativeElement.getBoundingClientRect();
    const toFlow = (x: number, y: number) => this._flow().getPositionInFlow({x, y});
    const min = toFlow(view.left, view.top);
    const max = toFlow(view.right, view.bottom);
    let position = {x: Math.round((min.x + max.x) / 2 - 200), y: Math.round((min.y + max.y) / 2 - 100)};
    const dataset = workflow.nodes.length ? undefined : workflow.inputs?.[0]?.position;
    if (dataset && dataset.x >= min.x && dataset.x + 400 <= max.x && dataset.y >= min.y && dataset.y + 500 <= max.y) {
      position = {x: dataset.x, y: dataset.y + 300};
    }
    const cards = [...workflow.nodes, ...(workflow.inputs ?? [])];
    while (cards.some(c => c.position && Math.abs(c.position.x - position.x) < 50 && Math.abs(c.position.y - position.y) < 50)) {
      position.x += 50;
      position.y += 50;
    }
    return position;
  }

  private updateWorkflow(
    updater: (w: WorkflowDTO) => WorkflowDTO
  ): void {
    this.workflow.update(w => {
      const updated = withTreHyperParams(updater(w), this.treSource());
      return {
        ...updated,
        nodes: [...updated.nodes],
        inputs: [...updated.inputs],
        connections: [...updated.connections]
      };
    });
  }

  public onLoaded(): void {
    this._canvas().resetScaleAndCenter(false);
    this.flowRendered = true;
    this.lastCenteredWorkflowId = this.selectedWorkflow()?.id;
  }

  public updateIsValid(isValid: boolean): void {
    this.workflowValid.set(isValid);
  }

  public openConnectDialog(): void {
    const selected = this.selected();
    const selectedIds = selected.map(s => this.getAppByNode(s))
      .filter(a => !!a)
      .map(a => a.id);
    if (selectedIds.length !== 2) {
      return;
    }
    const dialogRef = this.dialog.open(StoreGraphShortestPathDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        fromAppId: selectedIds[0],
        toAppId: selectedIds[1],
        howMany: 3
      } as ShortestPathDialog
    });
    dialogRef.afterClosed().subscribe((result: ToolGraphPathDTO | undefined) => {
      if (!result) return;
      const edges = result.edges;
      const neededAppIds = new Set<number>();
      edges.forEach(edge => {
        neededAppIds.add(edge.fromAppId);
        neededAppIds.add(edge.toAppId);
      });
      this.storeService.getApps(Array.from(neededAppIds)).subscribe(apps => {
        this.updateWorkflow(c => this._workflowService.addGraphEdges(c, edges, apps, w => this.newPosition(w)));
      })

    });
  }

  private getAppByNode(nodeId: string): AppDetailDto | undefined {
    const node = this.workflow().nodes.find(n => n.nodeId === nodeId);
    return node?.appDetail
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  model,
  OnInit,
  output,
  signal
} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {FFlowModule} from "@foblex/flow";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {PublishBadeType, PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {MatIcon} from "@angular/material/icon";
import {
  WorkflowNodeConnectorsComponent
} from "@shared-lib/modules/workflow/components/workflow-node-connectors/workflow-node-connectors.component";
import {MatDialog} from "@angular/material/dialog";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {WorkflowDTO, WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  AppCardCertBadgeComponent
} from "@shared-lib/modules/store/components/app-card-cert-badge/app-card-cert-badge.component";
import {AppCardTagsComponent} from "@shared-lib/modules/store/components/app-card-tags/app-card-tags.component";
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {AppTypeBadgeComponent} from "@shared-lib/modules/store/components/app-type-badge/app-type-badge.component";
import {MatDivider} from "@angular/material/divider";
import {
  WorkflowNodeDetailDialogComponent
} from "@shared-lib/modules/workflow/components/workflow-node-detail-dialog/workflow-node-detail-dialog.component";
import {WorkflowService} from "@shared-lib/modules/workflow/service/workflow.service";

@Component({
  selector: 'lib-workflow-node-card',
  imports: [
    MatCardModule,
    FFlowModule,
    PublishBadgeComponent,
    MatIcon,
    WorkflowNodeConnectorsComponent,
    AppCardCertBadgeComponent,
    AppCardTagsComponent,
    AppTypeBadgeComponent,
    MatDivider,
  ],
  templateUrl: './workflow-node-card.component.html',
  styleUrl: './workflow-node-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('editModeAnimation', [
      state('viewing', style({
        borderColor: '#e8eaf0',
        transform: 'scale(1)'
      })),
      state('editing', style({
        borderColor: '#4a69ff',
        transform: 'scale(1.02)',
        boxShadow: '0 8px 25px rgba(74, 105, 255, 0.2)'
      })),
      transition('viewing <=> editing', [
        animate('0.3s cubic-bezier(0.25, 0.8, 0.25, 1)')
      ]),
    ])
  ]
})
export class WorkflowNodeCardComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly workflowService: WorkflowService = inject(WorkflowService);

  node = model.required<WorkflowNodeDetailDTO>();
  workflow = model.required<WorkflowDTO>();

  editMode = signal<boolean>(false);
  isModel = signal<boolean>(false);
  deleteNode = output<void>();


  appData = signal<AppDetailDto | undefined>(undefined);
  modelData = signal<ModelDetailDto | undefined>(undefined);

  publishStatus = computed(() => this.appData()?.publishStatus as PublishBadeType);
  inputAmount = computed(() => this.workflow()?.inputs?.length ?? 0);
  executionOrder = computed(() => {
    const order = this.node().executionOrder;
    const inputAmount = this.inputAmount();
    if (order !== undefined) {
      return order + inputAmount + 1; //so it doesnt start with 0
    }
    return "-";
  });


  hyperParamEmpty = computed(() => {
    const hyperParams = this.node()?.hyperParams ?? {};
    const appData = (this.appData()?.appConfig?.hyperparams ?? []).length > 0;
    if (!appData) return false;
    return Object.keys(hyperParams).length === 0;
  });

  ngOnInit(): void {
    if (this.node().appDetail) {
      this.appData.set(this.node().appDetail!);
    }
    if (this.node().modelDetail) {
      this.appData.set(this.node().modelDetail!.federatedApp);
      this.modelData.set(this.node().modelDetail!);
      this.isModel.set(true)
    }
  }

  toggleEditMode(): void {
    this.editMode.set(!this.editMode());
    this.appCardEditClicked();
  }

  toggleExtendedMode(): void {
    this.node.update((n) => {
      n.extended = !n.extended;
      return n;
    });
  }

  appCardEditClicked(): void {
    const dialogRef = this.dialog.open(WorkflowNodeDetailDialogComponent, {
      width: '980px',
      height: '100%',
      position: {top: '0', right: '0'},
      autoFocus: false,
      data: this.node()
    });
    dialogRef.afterClosed().subscribe((result?: WorkflowNodeDetailDTO | boolean) => {
      if (result !== undefined) {
        if (result === false) {
          this.deleteNode.emit();
          return;
        } else {
          this.node.set({...result as WorkflowNodeDetailDTO});
          this.cdr.detectChanges();
        }
      }
      this.editMode.set(!this.editMode());
    });
  }
}

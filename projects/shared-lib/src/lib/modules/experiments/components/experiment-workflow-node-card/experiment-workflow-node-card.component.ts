import {Component, computed, input, model, OnInit, signal} from '@angular/core';
import {
  AppCardCertBadgeComponent
} from "@shared-lib/modules/store/components/app-card-cert-badge/app-card-cert-badge.component";
import {AppCardTagsComponent} from "@shared-lib/modules/store/components/app-card-tags/app-card-tags.component";
import {AppTypeBadgeComponent} from "@shared-lib/modules/store/components/app-type-badge/app-type-badge.component";
import {MatDivider} from "@angular/material/divider";
import {PublishBadeType, PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {
  WorkflowNodeConnectorsComponent
} from "@shared-lib/modules/workflow/components/workflow-node-connectors/workflow-node-connectors.component";
import {WorkflowDTO, WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ModelDetailDto} from "@shared-lib/modules/app-execution/dto/model";
import {MatIcon} from "@angular/material/icon";
import {BaseWorkflowStepDTO} from "@shared-lib/modules/experiments/dto/experiments";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {RunStatusTypes} from "../../../../../../../global-app/src/app/modules/tool-development/dto/test-run";

@Component({
  selector: 'lib-experiment-workflow-node-card',
  imports: [
    AppCardCertBadgeComponent,
    AppCardTagsComponent,
    AppTypeBadgeComponent,
    MatDivider,
    MatIcon,
    PublishBadgeComponent,
    WorkflowNodeConnectorsComponent,
    StatusBadgeComponent
  ],
  templateUrl: './experiment-workflow-node-card.component.html',
  styleUrl: './experiment-workflow-node-card.component.scss'
})
export class ExperimentWorkflowNodeCardComponent implements OnInit {
  node = model.required<WorkflowNodeDetailDTO>();
  workflow = input.required<WorkflowDTO>();
  step = input<BaseWorkflowStepDTO>();

  isModel = signal<boolean>(false);


  appData = signal<AppDetailDto | undefined>(undefined);
  modelData = signal<ModelDetailDto | undefined>(undefined);

  publishStatus = computed(() => this.appData()?.publishStatus as PublishBadeType)

  experimentStatus = computed(() => {
    return runStatusToBadgeStatus(this.experimentStatusText())
  });

  experimentStatusText = computed(() => {
    if(!this.step()) {
      return RunStatusTypes.INITIALIZED;
    }
    if (!this.step()!.stepStatus) {
      return RunStatusTypes.INITIALIZED;
    }
    return this.step()!.stepStatus!;
  })

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

  toggleExtendedMode(): void {
    this.node.update((n) => {
      n.extended = !n.extended;
      return n;
    });
  }
}

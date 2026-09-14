import {Component, computed, input, output} from '@angular/core';
import {WorkflowDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {publishToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {StoreDTO} from "@shared-lib/modules/store/dto/store";

@Component({
  selector: 'lib-workflow-overview-card',
  imports: [
    MatIcon,
    MatButton,
    TimeBadgeComponent,
    PublishBadgeComponent,
    StoreCardComponent
  ],
  templateUrl: './workflow-overview-card.component.html',
  styleUrl: './workflow-overview-card.component.scss',
})
export class WorkflowOverviewCardComponent {
  workflow = input.required<WorkflowDTO>();
  readonly clickable = input<boolean>(true);

  readonly workflowSelected = output<WorkflowDTO>();


  readonly summary = computed(() => {
    const wf = this.workflow();
    const nodes = wf.nodes ?? [];
    const inputs = wf.inputs ?? [];
    const connections = wf.connections ?? [];

    const appNodeCount = nodes.filter((n) => n.federatedAppId != null).length;
    const modelNodeCount = nodes.filter((n) => n.modelSubId != null).length;
    const legacyCount = nodes.filter((n) => n.oldFCVersion).length;

    const distinctAppIds = new Set<number>();
    nodes.forEach((n) => {
      if (n.federatedAppId != null) {
        distinctAppIds.add(n.federatedAppId);
      }
    });
    const distinctInputTypes = new Set<string>();
    inputs.forEach((n) => {
      if (n.type != null) {
        distinctInputTypes.add(n.type);
      }
    });
    return {
      nodeCount: nodes.length,
      connectionCount: connections.length,
      inputCount: inputs.length,
      appNodeCount,
      modelNodeCount,
      legacyCount,
      distinctInputCount: distinctInputTypes.size,
      distinctAppCount: distinctAppIds.size,
    };
  });

  readonly highlightedNodes = computed(() => {
    const wf = this.workflow();
    const nodes = wf.nodes ?? [];
    return nodes.slice(0, 3).map((n) => {
      const app = n.appDetail;
      const model = n.modelDetail;
      return {app, model} as StoreDTO;
    });
  });
  readonly publishStatus = computed(() => {
    const wf = this.workflow();
    return publishToBadgeStatus(wf.publishStatus);
  });

  onCardClick(): void {
    if (!this.clickable()) {
      return;
    }
    this.workflowSelected.emit(this.workflow());
  }
}

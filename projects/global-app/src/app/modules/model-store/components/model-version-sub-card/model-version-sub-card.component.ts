import {Component, input, output} from '@angular/core';
import {ModelSubDto} from "@shared-lib/modules/app-execution/dto/model";
import {modelSubStatusToBadgeStatus, pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {DockerImageTagComponent} from "@shared-lib/components/docker-image-tag/docker-image-tag.component";

@Component({
  selector: 'app-model-version-sub-card',
  imports: [
    StatusBadgeComponent,
    DockerImageTagComponent,
  ],
  templateUrl: './model-version-sub-card.component.html',
  styleUrl: './model-version-sub-card.component.scss'
})
export class ModelVersionSubCardComponent {
  id = input<number>();
  modelSub = input.required<ModelSubDto>();

  viewDetails = output<ModelSubDto>();

  public onViewDetails(): void {
    this.viewDetails.emit(this.modelSub());
  }

  protected readonly pipelineStatusToBadgeStatus = pipelineStatusToBadgeStatus;
  protected readonly modelSubStatusToBadgeStatus = modelSubStatusToBadgeStatus;
}

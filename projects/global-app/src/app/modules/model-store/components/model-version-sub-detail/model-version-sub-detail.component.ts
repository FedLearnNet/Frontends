import {Component, computed, inject, input, signal} from '@angular/core';
import {ModelSubDto, ModelSubFileDTO} from "@shared-lib/modules/app-execution/dto/model";
import {PipelineListComponent} from "../../../pipeline/components/pipeline-list/pipeline-list.component";
import {FileCardComponent} from "@shared-lib/modules/files/components/file-card/file-card.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {modelSubStatusToBadgeStatus, pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {DockerImageTagComponent} from "@shared-lib/components/docker-image-tag/docker-image-tag.component";
import {ModelService} from "@global-app/model-store/services/model.service";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {QueryDetailCardComponent} from "@shared-lib/modules/query/query-detail-card/query-detail-card.component";

@Component({
  selector: 'app-model-version-sub-detail',
  imports: [
    PipelineListComponent,
    FileCardComponent,
    StatusBadgeComponent,
    DockerImageTagComponent,
    InfoGridComponent,
    InfoItemComponent,
    QueryDetailCardComponent,
  ],
  templateUrl: './model-version-sub-detail.component.html',
  styleUrl: './model-version-sub-detail.component.scss'
})
export class ModelVersionSubDetailComponent {
  private readonly modelService = inject(ModelService);

  modelSub = input.required<ModelSubDto>();
  protected readonly modelSubStatusToBadgeStatus = modelSubStatusToBadgeStatus;
  protected readonly pipelineStatusToBadgeStatus = pipelineStatusToBadgeStatus;

  private readonly removedFileIds = signal<Set<number>>(new Set());
  readonly files = computed<ModelSubFileDTO[]>(() =>
    this.modelSub().files.filter(f => !this.removedFileIds().has(f.id)));

  onDownloadFile(modelSubFile: ModelSubFileDTO): void {
    this.modelService.downloadModelSubFile(modelSubFile.id).subscribe(link => link.click());
  }

  onDeleteFile(modelSubFile: ModelSubFileDTO): void {
    const name = modelSubFile.file?.fileName ?? 'this file';
    if (!confirm(`Delete ${name}? This cannot be undone.`)) {
      return;
    }
    this.modelService.deleteModelSubFile(modelSubFile.id).subscribe(() =>
      this.removedFileIds.update(ids => new Set(ids).add(modelSubFile.id)));
  }
}

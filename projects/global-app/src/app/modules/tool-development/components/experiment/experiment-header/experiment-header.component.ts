import {Component, computed, inject, input} from '@angular/core';
import {RouterLink} from '@angular/router';

import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';

import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {ExperimentDetailDTO, ExperimentRunDTO} from '@shared-lib/modules/app-execution/dto/experiment';
import {ModelVersionDto} from '@shared-lib/modules/app-execution/dto/model';
import {RunStatusTypes} from '../../../dto/test-run';
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {Location} from "@angular/common";

@Component({
  selector: 'app-experiment-header',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, RouterLink, ErrorCardComponent, KvComponent, StatusBadgeComponent, StoreCardComponent, PublishBadgeComponent, MatIcon, MatIconButton, MatToolbar],
  templateUrl: './experiment-header.component.html',
  styleUrl: './experiment-header.component.scss',
})
export class ExperimentHeaderComponent {
  private readonly location: Location = inject(Location);

  app = input<AppDetailDto | undefined>(undefined);
  experiment = input<ExperimentDetailDTO | undefined>(undefined);
  run = input<ExperimentRunDTO | undefined>(undefined);
  model = input<ModelVersionDto | undefined>(undefined);

  totalRuns = computed(() => this.experiment()?.runs?.length ?? 0);

  passedRuns = computed(() => {
    const runs = this.experiment()?.runs ?? [];
    const finished = RunStatusTypes.FINISHED.toLowerCase();
    return runs.filter(r => (r.status ?? '').toLowerCase() === finished).length;
  });

  failedRuns = computed(() => {
    const runs = this.experiment()?.runs ?? [];
    const error = RunStatusTypes.ERROR.toLowerCase();
    return runs.filter(r => (r.status ?? '').toLowerCase() === error).length;
  });

  getInputNames(): string[] {
    const paths = this.experiment()?.inputFilePaths;
    return paths ? Object.keys(paths) : [];
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;

  onGoBack(): void {
    this.location.back();
  }
}

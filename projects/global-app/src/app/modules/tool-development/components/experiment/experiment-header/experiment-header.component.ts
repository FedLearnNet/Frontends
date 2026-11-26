import {Component, computed, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from '@angular/router';

import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';

import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {ModelVersionDto} from '@shared-lib/modules/app-execution/dto/model';
import {RunStatusTypes, TestAttemptDTO, TestRunDTO, testStepOf, trialNameOf, trialsOf} from '../../../dto/test-run';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experiment-header.component.scss',
})
export class ExperimentHeaderComponent {
  private readonly location: Location = inject(Location);

  app = input<AppDetailDto | undefined>(undefined);
  experiment = input<TestRunDTO | undefined>(undefined);
  // A trial of the experiment, shown on its detail.
  run = input<TestAttemptDTO | undefined>(undefined);
  model = input<ModelVersionDto | undefined>(undefined);

  private readonly trials = computed(() => {
    const experiment = this.experiment();
    return experiment ? trialsOf(experiment) : [];
  });

  totalRuns = computed(() => this.trials().length);

  passedRuns = computed(() => {
    const runs = this.trials();
    const finished = RunStatusTypes.FINISHED.toLowerCase();
    return runs.filter(r => (r.status ?? '').toLowerCase() === finished).length;
  });

  failedRuns = computed(() => {
    const runs = this.trials();
    const error = RunStatusTypes.ERROR.toLowerCase();
    return runs.filter(r => (r.status ?? '').toLowerCase() === error).length;
  });

  getInputNames(): string[] {
    const experiment = this.experiment();
    const paths = experiment ? testStepOf(experiment)?.inputFilePaths : undefined;
    return paths ? Object.keys(paths) : [];
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
  protected readonly trialNameOf = trialNameOf;

  onGoBack(): void {
    this.location.back();
  }
}

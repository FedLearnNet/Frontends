import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import {ProjectStatus} from "@global-app/project/dto/project";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {projectStatusToBadgeStatus, runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {ProjectRunDTO} from "@global-app/project/dto/project-experiments";
import {BaseExecutionAttemptDTO, ExecutionRunDTO, isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";
import {RunStatusTypes} from "../../../../tool-development/dto/test-run";

/** Name, status and times of a training, with starting and stopping it. */
@Component({
  selector: 'app-experiment-header',
  imports: [
    MatIcon,
    MatButton,
    SseRefreshBtnComponent,
    StatusBadgeComponent,
    TimeBadgeComponent,
    InfoItemComponent,
    InfoGridComponent,
    HeaderComponent,
  ],
  templateUrl: './experiment-header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experiment-header.component.scss'
})
export class ExperimentHeaderComponent {
  loading = input<boolean>(false);
  hasGoBack = input<boolean>(true);
  hasActions = input<boolean>(true);
  isSSEConnected = input<boolean>(false);
  // Any run; the one of a project's training names it through its experiment.
  run = input.required<ExecutionRunDTO<BaseExecutionAttemptDTO> & Partial<Pick<ProjectRunDTO, 'experiment'>>>();
  title = input<string>();
  subtitle = input<string>();

  stop = output();
  startExperiment = output();
  refresh = output();

  name = computed(() => this.title() ?? this.run().experiment?.name ?? this.run().name ?? undefined);
  description = computed(() => this.subtitle() ?? this.run().experiment?.description ?? undefined);

  // A training across clinics starts once enough clinics accepted it, its experiment tells.
  private readonly accepting = computed(() => this.run().experiment?.status ?? undefined);

  canRun = computed(() => this.accepting()
    ? this.accepting() === ProjectStatus.READY
    : this.run().status === RunStatusTypes.PENDING && !this.run().startedAt);
  canStop = computed(() => !!this.run().startedAt && !isFinalStatus(this.run().status));

  statusText = computed(() => this.accepting() ?? this.run().status);
  statusType = computed(() => this.accepting()
    ? projectStatusToBadgeStatus(this.accepting()!)
    : runStatusToBadgeStatus(this.run().status));
}

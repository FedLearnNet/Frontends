import {Component, computed, DestroyRef, inject, input, output, signal} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {Location} from "@angular/common";
import {BaseWorkflowExperimentDTO} from "@shared-lib/modules/experiments/dto/experiments";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import {ProjectStatus} from "@global-app/project/dto/project";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {projectStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {interval} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";

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
    HeaderComponent,
  ],
  templateUrl: './experiment-header.component.html',
  styleUrl: './experiment-header.component.scss'
})
export class ExperimentHeaderComponent {
  private readonly location: Location = inject(Location);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  name = input<string>();
  description = input<string>();
  loading = input<boolean>(false);
  hasGoBack = input<boolean>(true);
  hasActions = input<boolean>(true);
  isSSEConnected = input<boolean>(false);
  experiment = input.required<BaseWorkflowExperimentDTO>();

  stop = output();
  startExperiment = output();
  refresh = output();

  canRun = computed(() => this.experiment().experimentStatus === ProjectStatus.READY);
  canStop = computed(() => this.experiment()!.experimentStatus === ProjectStatus.RUNNING);
  duration = computed(() => {
    const exp = this.experiment();
    const startedAt = exp.startedAt;
    const finishedAt = exp.finishedAt;

    if (!startedAt) {
      return 'N/A';
    }

    try {
      const startTime = new Date(startedAt).getTime();
      if (isNaN(startTime)) {
        return 'N/A';
      }

      if (finishedAt) {
        const finishTime = new Date(finishedAt).getTime();
        if (isNaN(finishTime)) {
          return this.formatDuration(this.now() - startTime);
        }
        return this.formatDuration(finishTime - startTime);
      }

      return this.formatDuration(this.now() - startTime);

    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'Error';
    }
  });

  private now = signal(Date.now());

  constructor() {
    // Update the 'now' signal every 1000ms
    // This will automatically trigger the 'duration' signal to re-compute
    // if it's in a "running" state.
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.now.set(Date.now());
      });
  }

  goBack(): void {
    this.location.back();
  }

  private formatDuration(ms: number): string {
    if (ms < 0) ms = 0;

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const s = seconds % 60;
    const m = minutes % 60;
    const h = hours;

    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);

    if (s > 0 || parts.length === 0) {
      parts.push(`${s}s`);
    }

    return parts.join(' ');
  }

  protected readonly projectStatusToBadgeStatus = projectStatusToBadgeStatus;
}

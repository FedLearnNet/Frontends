import {ChangeDetectionStrategy, Component, computed, effect, inject, input} from '@angular/core';
import {Location} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Store} from '@ngrx/store';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {ContainerDTO} from '@shared-lib/modules/admin/dto/orch';
import {OrchActions} from '@shared-lib/modules/admin/store/orch.actions';
import {
  selectOrchError,
  selectRunningContainerLoading,
  selectRunningLogs,
  selectRunningLogsContainerId,
  selectRunningLogsStreaming,
  selectSelectedRunningContainer
} from '@shared-lib/modules/admin/store/orch.selectors';
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {HeroNavbarComponent} from "@shared-lib/components/hero-navbar/hero-navbar.component";
import {RawLogViewerComponent} from "@shared-lib/components/raw-log-viewer/raw-log-viewer.component";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {dockerStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import {PipelineStatus} from "../../../../../../../global-app/src/app/modules/pipeline/dto/pipeline";
import {MatTooltip} from "@angular/material/tooltip";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";

@Component({
  selector: 'lib-admin-docker-container-detail-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    ErrorCardComponent,
    KvComponent,
    HintCardComponent,
    HeroNavbarComponent,
    RawLogViewerComponent,
    MarkdownComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    SseRefreshBtnComponent,
    MatTooltip,
    TimeBadgeComponent,
  ],
  templateUrl: './admin-docker-container-detail-page.component.html',
  styleUrl: './admin-docker-container-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideMarkdown()],
})
export class AdminDockerContainerDetailPageComponent {
  private readonly store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);
  private readonly location = inject(Location);

  readonly containerId = input.required<string>();

  readonly container = this.store.selectSignal(selectSelectedRunningContainer);
  readonly loading = this.store.selectSignal(selectRunningContainerLoading);
  readonly error = this.store.selectSignal(selectOrchError);
  readonly logs = this.store.selectSignal(selectRunningLogs);
  readonly streaming = this.store.selectSignal(selectRunningLogsStreaming);
  readonly logsContainerId = this.store.selectSignal(selectRunningLogsContainerId);

  readonly containerName = computed(() => this.container()?.Names?.[0] ?? this.containerId());
  readonly labels = computed(() => Object.entries(this.container()?.Labels ?? {}));
  readonly networks = computed(() => Object.entries(this.container()?.NetworkSettings?.Networks ?? {}));
  readonly mounts = computed(() => this.container()?.Mounts ?? []);
  readonly rawJson = computed(() => "```json\n" + JSON.stringify(this.container(), null, 2) + "\n```");
  readonly logText = computed(() => this.logs().join('\n'));
  readonly isViewingLogs = computed(() => this.logsContainerId() === this.containerId());

  constructor() {
    effect(() => {
      const id = this.containerId();
      if (id) {
        this.store.dispatch(OrchActions.loadRunningContainer({id}));
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  viewLogs(): void {
    this.store.dispatch(OrchActions.streamRunningLogs({id: this.containerId()}));
  }

  stopLogs(): void {
    this.store.dispatch(OrchActions.stopRunningLogsStream({id: this.containerId()}));
  }

  async copyToClipboard(value?: string | null, label: string = 'Value'): Promise<void> {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    this.snackBar.open(`${label} copied`, 'Close', {duration: 2000});
  }

  ports(container: ContainerDTO | null): string {
    if (!container?.Ports?.length) {
      return 'No published ports';
    }

    return container.Ports.map((port) =>
      `${port.PublicPort ?? '-'} -> ${port.PrivatePort ?? '-'} / ${port.Type ?? 'tcp'}`
    ).join(', ');
  }

  created(container: ContainerDTO | null): Date | null {
    if (!container?.Created) {
      return null;
    }

    return new Date(container.Created * 1000);
  }

  protected readonly dockerStatusToBadgeStatus = dockerStatusToBadgeStatus;
  protected readonly PipelineStatus = PipelineStatus;
}

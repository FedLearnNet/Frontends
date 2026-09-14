import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {SlicePipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {SelectionModel} from '@angular/cdk/collections';
import {Store} from '@ngrx/store';
import {
  AdminDockerKpisComponent
} from '@shared-lib/modules/admin/components/admin-docker-kpis/admin-docker-kpis.component';
import {
  AdminDockerRunDetailDialogComponent
} from '@shared-lib/modules/admin/components/admin-docker-run-detail-dialog/admin-docker-run-detail-dialog.component';
import {
  AdminDockerVolumeDetailDialogComponent
} from '@shared-lib/modules/admin/components/admin-docker-volume-detail-dialog/admin-docker-volume-detail-dialog.component';
import {ContainerDTO, ContainerRunDTO, InfoDTO, InspectVolumeResponseDTO} from '@shared-lib/modules/admin/dto/orch';
import {OrchRelayService} from '@shared-lib/modules/admin/services/orch.service';
import {OrchActions} from '@shared-lib/modules/admin/store/orch.actions';
import {
  selectDockerInfo,
  selectFcContainers,
  selectFcContainersCleaning,
  selectFcContainersLoading,
  selectOrchError,
  selectOrchLoading,
  selectRunningContainers,
  selectRunningLogs,
  selectRunningLogsContainerId,
  selectRunningLogsStreaming,
  selectRuns,
  selectVolumes,
  selectVolumeRemoving,
} from '@shared-lib/modules/admin/store/orch.selectors';
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {dockerStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {MatTooltip} from "@angular/material/tooltip";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

@Component({
  selector: 'lib-admin-docker-dashboard',
  imports: [
    SlicePipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
    MatTabsModule,
    AdminDockerKpisComponent,
    StatusBadgeComponent,
    TimeBadgeComponent,
    MatTooltip,
    RouterLink,
    HeaderComponent,
    PageWrapperComponent,
  ],
  templateUrl: './admin-docker-dashboard.component.html',
  styleUrl: './admin-docker-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDockerDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly orchService = inject(OrchRelayService);
  private readonly destroyRef = inject(DestroyRef);

  readonly containerSearch = signal('');
  readonly fcHardCleanup = signal(false);
  readonly fcSelection = new SelectionModel<string>(true, []);

  readonly dockerInfo = this.store.selectSignal(selectDockerInfo);
  readonly runningContainers = this.store.selectSignal(selectRunningContainers);
  readonly runs = this.store.selectSignal(selectRuns);
  readonly volumes = this.store.selectSignal(selectVolumes);
  readonly runningLogs = this.store.selectSignal(selectRunningLogs);
  readonly runningLogsContainerId = this.store.selectSignal(selectRunningLogsContainerId);
  readonly runningLogsStreaming = this.store.selectSignal(selectRunningLogsStreaming);
  readonly fcContainers = this.store.selectSignal(selectFcContainers);
  readonly fcContainersLoading = this.store.selectSignal(selectFcContainersLoading);
  readonly fcContainersCleaning = this.store.selectSignal(selectFcContainersCleaning);
  readonly volumeRemoving = this.store.selectSignal(selectVolumeRemoving);
  readonly loading = this.store.selectSignal(selectOrchLoading);
  readonly error = this.store.selectSignal(selectOrchError);

  readonly filteredContainers = computed(() => {
    const term = this.containerSearch().trim().toLowerCase();
    const containers = this.runningContainers() ?? [];

    if (!term) {
      return containers;
    }

    return containers.filter((container) =>
      this.containerName(container).toLowerCase().includes(term) ||
      (container.Image ?? '').toLowerCase().includes(term) ||
      (container.Id ?? '').toLowerCase().includes(term)
    );
  });

  readonly sortedRuns = computed(() =>
    [...(this.runs() ?? [])].sort((left, right) => (right.id ?? 0) - (left.id ?? 0))
  );

  readonly sortedVolumes = computed(() =>
    [...(this.volumes() ?? [])].sort((left, right) => this.volumeName(left).localeCompare(this.volumeName(right)))
  );

  readonly logText = computed(() => this.runningLogs().join('\n'));

  constructor() {
    this.destroyRef.onDestroy(() => {
      const containerId = this.runningLogsContainerId();
      if (containerId) {
        this.store.dispatch(OrchActions.stopRunningLogsStream({id: containerId}));
      }
    });
  }

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.store.dispatch(OrchActions.loadDashboard());
  }


  openRunDetail(id: number): void {
    this.dialog.open(AdminDockerRunDetailDialogComponent, {
      autoFocus: false,
      data: {runId: id},
      maxWidth: '96vw',
      width: 'min(1080px, 96vw)',
    });
  }

  openVolumeDetail(name: string): void {
    this.dialog.open(AdminDockerVolumeDetailDialogComponent, {
      autoFocus: false,
      data: {name},
      maxWidth: '96vw',
      width: 'min(920px, 96vw)',
    });
  }

  // ---- FC Containers ----
  get fcAllSelected(): boolean {
    const containers = this.fcContainers();
    return containers.length > 0 && this.fcSelection.selected.length === containers.length;
  }

  get fcIndeterminate(): boolean {
    return this.fcSelection.selected.length > 0 && !this.fcAllSelected;
  }

  toggleFcAll(): void {
    if (this.fcAllSelected) {
      this.fcSelection.clear();
    } else {
      this.fcContainers().forEach(c => this.fcSelection.select(c.Id));
    }
  }

  cleanupSelectedFc(): void {
    const containerIds = [...this.fcSelection.selected];
    if (!containerIds.length) {
      return;
    }
    this.store.dispatch(OrchActions.cleanupFcContainers({containerIds, cleanup: this.fcHardCleanup()}));
    this.fcSelection.clear();
  }

  stopRunContainer(run: ContainerRunDTO): void {
    if (!run.containerId) {
      return;
    }
    this.store.dispatch(OrchActions.cleanupFcContainers({containerIds: [run.containerId], cleanup: false}));
  }

  removeVolume(name: string): void {
    this.store.dispatch(OrchActions.removeVolume({name}));
  }

  async copyToClipboard(value?: string | null, label: string = 'Value'): Promise<void> {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    this.snackBar.open(`${label} copied`, 'Close', {duration: 2000});
  }

  containerName(container: ContainerDTO): string {
    return container.Names?.[0] ?? container.Id;
  }

  containerCreated(container: ContainerDTO): Date | null {
    return container.Created ? new Date(container.Created * 1000) : null;
  }

  containerPorts(container: ContainerDTO): string {
    if (!container.Ports?.length) {
      return 'No published ports';
    }

    return container.Ports.map((port) =>
      `${port.PublicPort ?? '-'} -> ${port.PrivatePort ?? '-'} / ${port.Type ?? 'tcp'}`
    ).join(', ');
  }

  volumeName(volume: InspectVolumeResponseDTO): string {
    return (volume as any)?.name ?? (volume as any)?.Name ?? '—';
  }

  volumeDriver(volume: InspectVolumeResponseDTO): string {
    return (volume as any)?.driver ?? (volume as any)?.Driver ?? '—';
  }

  volumeMountpoint(volume: InspectVolumeResponseDTO): string {
    return (volume as any)?.mountpoint ?? (volume as any)?.Mountpoint ?? '—';
  }

  volumeSize(volume: InspectVolumeResponseDTO): string {
    const bytes = (volume as any)?.usageData?.size ?? (volume as any)?.UsageData?.Size;
    return this.formatBytes(bytes);
  }

  downloadHref(run: ContainerRunDTO): string | null {
    if (run.workflowId == null || run.appId == null || run.workflowStep == null) {
      return null;
    }

    return this.orchService.volumeWorkflowDownloadHref(run.workflowId, run.appId, run.workflowStep);
  }

  systemLabel(info: InfoDTO | null): string {
    if (!info) {
      return '—';
    }

    return [info.OperatingSystem, info.Architecture].filter(Boolean).join(' / ') || '—';
  }

  private formatBytes(value: number | null | undefined): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '—';
    }

    if (value < 1024) {
      return `${value} B`;
    }

    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = value / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  protected readonly dockerStatusToBadgeStatus = dockerStatusToBadgeStatus;
}

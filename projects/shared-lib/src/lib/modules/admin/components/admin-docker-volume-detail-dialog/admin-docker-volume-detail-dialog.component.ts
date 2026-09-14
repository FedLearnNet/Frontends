import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Store} from '@ngrx/store';
import {CloseableDialogTitleComponent} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {InspectVolumeResponseDTO} from '@shared-lib/modules/admin/dto/orch';
import {OrchActions} from '@shared-lib/modules/admin/store/orch.actions';
import {
  selectOrchError,
  selectSelectedVolume,
  selectVolumeLoading
} from '@shared-lib/modules/admin/store/orch.selectors';

export interface AdminDockerVolumeDetailDialogData {
  name: string;
}

@Component({
  selector: 'lib-admin-docker-volume-detail-dialog',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatIconModule,
    MatProgressSpinnerModule,
    CloseableDialogTitleComponent,
    ErrorCardComponent,
  ],
  templateUrl: './admin-docker-volume-detail-dialog.component.html',
  styleUrl: './admin-docker-volume-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDockerVolumeDetailDialogComponent {
  private readonly store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);

  readonly dialogRef = inject(MatDialogRef<AdminDockerVolumeDetailDialogComponent>);
  readonly data = inject<AdminDockerVolumeDetailDialogData>(MAT_DIALOG_DATA);

  readonly volume = this.store.selectSignal(selectSelectedVolume);
  readonly loading = this.store.selectSignal(selectVolumeLoading);
  readonly error = this.store.selectSignal(selectOrchError);
  readonly labels = computed(() => Object.entries(this.readRecord(this.volume(), 'labels', 'Labels')));
  readonly options = computed(() => Object.entries(this.readRecord(this.volume(), 'options', 'Options')));
  readonly rawJson = computed(() => JSON.stringify(this.volume(), null, 2));

  constructor() {
    this.store.dispatch(OrchActions.loadVolume({name: this.data.name}));
  }

  async copyToClipboard(value?: string | null, label: string = 'Value'): Promise<void> {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    this.snackBar.open(`${label} copied`, 'Close', {duration: 2000});
  }

  name(volume: InspectVolumeResponseDTO | null): string {
    return (volume as any)?.name ?? (volume as any)?.Name ?? this.data.name;
  }

  driver(volume: InspectVolumeResponseDTO | null): string {
    return (volume as any)?.driver ?? (volume as any)?.Driver ?? '—';
  }

  mountpoint(volume: InspectVolumeResponseDTO | null): string {
    return (volume as any)?.mountpoint ?? (volume as any)?.Mountpoint ?? '—';
  }

  scope(volume: InspectVolumeResponseDTO | null): string {
    return (volume as any)?.scope ?? (volume as any)?.Scope ?? '—';
  }

  usageSize(volume: InspectVolumeResponseDTO | null): string {
    const size = (volume as any)?.usageData?.size ?? (volume as any)?.UsageData?.Size;
    return this.formatBytes(size);
  }

  refCount(volume: InspectVolumeResponseDTO | null): number | string {
    return (volume as any)?.usageData?.refCount ?? (volume as any)?.UsageData?.RefCount ?? '—';
  }

  private readRecord(
    volume: InspectVolumeResponseDTO | null,
    camelKey: string,
    pascalKey: string
  ): Record<string, string> {
    return ((volume as any)?.[camelKey] ?? (volume as any)?.[pascalKey] ?? {}) as Record<string, string>;
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
}

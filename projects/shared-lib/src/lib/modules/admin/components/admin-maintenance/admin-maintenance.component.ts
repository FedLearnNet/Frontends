import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter, Observable, timer} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialog} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {HintCardComponent} from '@shared-lib/components/hint-card/hint-card.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {StatusBadeType, StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {ApiErrorSnackbarService} from '@shared-lib/services/api-error-snackbar.service';
import {BackupDTO, MaintenanceDTO, MaintenanceMode} from '../../dto/maintenance';
import {MaintenanceService} from '../../services/maintenance.service';

const RECONNECT_DELAY_MS = 5000;

const LABELS: Record<MaintenanceMode, string> = {
  PREPARE: 'Download',
  APPLY: 'Installation',
  ROLLBACK: 'Rollback',
  BACKUP: 'Backup',
  RESTORE: 'Restore'
};

@Component({
  selector: 'lib-admin-maintenance',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    HintCardComponent,
    PageWrapperComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './admin-maintenance.component.html',
  styleUrl: './admin-maintenance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminMaintenanceComponent {
  private readonly service = inject(MaintenanceService);
  private readonly dialog = inject(MatDialog);
  private readonly errors = inject(ApiErrorSnackbarService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isPlatform = this.service.isPlatform;
  readonly kind = this.isPlatform ? 'platform' : 'client';
  readonly maintenance = signal<MaintenanceDTO | null>(null);
  // an installation restarts the API itself, so it is away for a while
  readonly unreachable = signal(false);
  // platform only: the version its admin names
  readonly requested = signal('');
  // a backup with configuration and secrets
  readonly all = signal(false);
  // why the last request failed, the page keeps the state before
  readonly error = signal<string | null>(null);
  // the backup whose details are open
  readonly selected = signal<string | null>(null);

  readonly status = computed(() => this.maintenance()?.status);
  readonly upgrade = computed(() => this.status()?.lastUpgrade);
  // the version of a finished download, else empty
  readonly prepared = computed(() => {
    const upgrade = this.upgrade();
    return upgrade?.step === 'PREPARE' && upgrade.done ? upgrade.flNetSoftwareVersion ?? '' : '';
  });
  readonly target = computed(() => this.isPlatform
    ? this.requested().trim() || this.prepared()
    : this.maintenance()?.targetVersion ?? '');
  readonly idle = computed(() => !!this.status()?.enabled && !this.status()?.running);
  readonly canPrepare = computed(() => this.idle() && !!this.target());
  readonly canApply = computed(() => this.idle() && !!this.prepared() && this.prepared() === this.target());
  readonly canRollback = computed(() => this.idle() && this.upgrade()?.step === 'APPLY' && !!this.upgrade()?.done);

  // what runs right now, for the banner
  readonly activity = computed(() => {
    const running = this.status()?.running;
    if (!running) {
      return '';
    }
    return running === 'BACKUP' || running === 'RESTORE' ? `${LABELS[running]} is running`
      : `${LABELS[running]} of ${this.target() || this.upgrade()?.flNetSoftwareVersion} is running`;
  });

  // the last update in short, for the badge
  readonly updateBadge = computed<{ text: string, type: StatusBadeType }>(() => {
    const running = this.status()?.running;
    const upgrade = this.upgrade();
    if (running === 'PREPARE' || running === 'APPLY' || running === 'ROLLBACK') {
      return {text: 'Running', type: 'RUNNING'};
    }
    if (!upgrade?.step) {
      return {text: 'No update yet', type: 'INIT'};
    }
    if (!upgrade.done) {
      return {text: `${LABELS[upgrade.step]} failed`, type: 'FAILED'};
    }
    return {text: {PREPARE: 'Downloaded', APPLY: 'Installed', ROLLBACK: 'Rolled back'}[upgrade.step as 'PREPARE'], type: 'SUCCESS'};
  });

  // the last update in a sentence
  readonly updateText = computed(() => {
    const upgrade = this.upgrade();
    if (!upgrade?.step) {
      return this.isPlatform ? 'Enter the version to install, e.g. the latest release.'
        : 'This client installs the version of its platform once the platform runs a newer one.';
    }
    if (!upgrade.done) {
      return `${LABELS[upgrade.step]} of ${upgrade.flNetSoftwareVersion} failed: ${upgrade.lastLogMessage}`;
    }
    switch (upgrade.step) {
      case 'PREPARE':
        return `${upgrade.flNetSoftwareVersion} is downloaded. Install it once all executions are finished.`;
      case 'APPLY':
        return `${upgrade.flNetSoftwareVersion} is installed.`;
      default:
        return upgrade.lastLogMessage ?? 'Rolled back to the version before the last update.';
    }
  });

  constructor() {
    this.follow(this.service.load());
  }

  start(mode: MaintenanceMode): void {
    const version = this.isPlatform ? this.target() : undefined;
    if (mode !== 'ROLLBACK') {
      this.run(mode, version);
      return;
    }
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Roll back the last update?',
        message: 'Configuration and databases go back to the backup taken before it. Everything written since then is lost.',
        confirmButtonText: 'Roll back',
      }
    }).afterClosed().pipe(filter(Boolean)).subscribe(() => this.run(mode, version));
  }

  backup(): void {
    this.run('BACKUP', undefined, this.all());
  }

  toggle(backup: BackupDTO): void {
    this.selected.update(name => name === backup.name ? null : backup.name);
  }

  // only a complete backup of the installed version is restored here, others on the server with flnet
  restorable(backup: BackupDTO): boolean {
    return backup.complete && backup.version === this.maintenance()?.installedVersion;
  }

  restore(backup: BackupDTO): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `Restore ${backup.name}?`,
        message: `${backup.backUpAll ? 'Databases, configuration and secrets go' : 'The databases go'} back to this backup `
          + `and everything written since then is lost. The ${this.kind} is offline for a few minutes.`,
        confirmButtonText: 'Restore',
      }
    }).afterClosed().pipe(filter(Boolean)).subscribe(() => this.run('RESTORE', undefined, false, backup.name));
  }

  // of a backup that is not complete
  backupState(backup: BackupDTO): { text: string, type: StatusBadeType } {
    if (backup.message) {
      return {text: 'Failed', type: 'FAILED'};
    }
    return this.status()?.running === 'BACKUP' ? {text: 'Running', type: 'RUNNING'} : {text: 'Interrupted', type: 'WARNING'};
  }

  private run(mode: MaintenanceMode, version?: string, all = false, backup?: string): void {
    this.error.set(null);
    this.follow(this.service.start(mode, version, all, backup), mode);
  }

  // shows every state of a stream; a stream that breaks off, e.g. as an installation restarts the API, is opened
  // again once it is back
  private follow(states: Observable<MaintenanceDTO>, starting?: MaintenanceMode): void {
    let received = false;
    states.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: maintenance => {
        received = true;
        this.unreachable.set(false);
        const error = maintenance.status.lastError;
        if (error) {
          this.error.set(starting ? `Could not start the ${LABELS[starting].toLowerCase()}: ${error}` : error);
          return;
        }
        this.maintenance.set(maintenance);
      },
      error: err => {
        if (starting && !received) {
          this.errors.showSnackBar(err, `Could not start: ${LABELS[starting].toLowerCase()}`);
          return;
        }
        this.unreachable.set(true);
        timer(RECONNECT_DELAY_MS).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.follow(this.service.load()));
      }
    });
  }
}

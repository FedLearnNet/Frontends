import {Component, DestroyRef, OnInit, computed, inject, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {Location} from '@angular/common';
import {Actions, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {catchError, finalize, map, of} from 'rxjs';
import {MatTooltip} from '@angular/material/tooltip';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialog} from '@angular/material/dialog';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {BytesPipe} from '@shared-lib/pipies/bytes.pipe';
import {ColumnProfile} from '@shared-lib/modules/files/dto/file';
import {ConnectorFilesDetailDTO, ConnectorFileUploadInfoDTO} from '../../dto/upload-info';
import {ConnectorUploadService} from '../../services/connector-upload.service';
import {
  ConnectorFileSheetDetailCardComponent,
  ConnectorFileSheetView
} from './components/connector-file-sheet-detail-card/connector-file-sheet-detail-card.component';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {ImportStatusEnum} from "../../dto/connector.enum";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {ImportActions} from '../../store/import/import.actions';
import {selectCohortImports} from '../../store/import/import.selectors';
import {
  ImportActivityChipComponent
} from '../import/import-activity-chip/import-activity-chip.component';

@Component({
  selector: 'app-connector-file-detail',
  templateUrl: './connector-file-detail.component.html',
  styleUrl: './connector-file-detail.component.scss',
  imports: [
    MatTooltip,
    MatTabsModule,
    BadgeComponent,
    KvComponent,
    TimeBadgeComponent,
    BytesPipe,
    ConnectorFileSheetDetailCardComponent,
    HeaderComponent,
    PageWrapperComponent,
    BtnComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ImportActivityChipComponent,
    DecimalPipe,
    RouterLink
  ]
})
export class ConnectorFileDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly actions = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  private readonly dialog = inject(MatDialog);
  private readonly uploadService = inject(ConnectorUploadService);

  readonly cohortId = Number(this.route.snapshot.paramMap.get('cohortId'));
  readonly fileId = Number(this.route.snapshot.paramMap.get('fileId'));

  readonly file = signal<ConnectorFilesDetailDTO | null>(this.route.snapshot.data['file'] ?? null);
  private readonly cohortImports = this.store.selectSignal(selectCohortImports(
    Number(this.route.snapshot.paramMap.get('cohortId'))));
  readonly loading = signal(false);
  readonly error = signal<string | object | null>(null);

  readonly sheetViews = computed(() => {
    const file = this.file();
    if (!file) {
      return [] as ConnectorFileSheetView[];
    }

    return (file.uploadInfo ?? []).map((sheetInfo, index) => this.toSheetView(sheetInfo, index));
  });

  readonly rowsScanned = computed(() => this.sheetViews().reduce((sum, sheet) => sum + sheet.rowsScanned, 0));
  readonly columnCount = computed(() =>
    this.sheetViews().reduce((sum, sheet) => sum + sheet.columns.length, 0));
  readonly missingValues = computed(() =>
    this.sheetViews().reduce((sum, sheet) => sum + sheet.missingValues, 0));
  readonly runs = computed(() => this.file()?.runs ?? []);

  readonly parsing = computed(() => this.file()?.uploadSettings);

  readonly delimiterLabel = computed(() => {
    const delimiter = this.parsing()?.delimiter;
    if (delimiter === 'CUSTOM') {
      return this.parsing()?.customDelimiter || 'Custom';
    }
    if (delimiter === '\t') {
      return 'Tab';
    }
    return delimiter === 's' ? 'Space' : delimiter ?? '';
  });

  readonly imports = computed(() =>
    this.cohortImports().filter(activity => activity.finishedAt === undefined));

  ngOnInit(): void {
    this.store.dispatch(ImportActions.loadCohortImports({cohortId: this.cohortId}));
    this.actions.pipe(ofType(ImportActions.importFinished), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refresh());
  }

  onGoBack(): void {
    this.location.back();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);

    // Statistics and preview data are persisted on upload, so we can load the saved
    // profile directly instead of forcing an expensive recomputation.
    this.uploadService.getFileDetail(this.cohortId, this.fileId).pipe(
      finalize(() => this.loading.set(false)),
      catchError((error) => {
        this.error.set(error);
        return of(null);
      })
    ).subscribe(file => {
      if (file) {
        this.file.set(file);
      }
    });
  }

  downloadFile(): void {
    const file = this.file();
    if (!file) {
      return;
    }

    this.uploadService.downloadFile(file.cohortId!, file.id!).subscribe(link => link.click());
  }

  deleteFile(): void {
    const file = this.file();
    if (!file) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete file',
        message: `Do you want to delete "${file.fileName}" from this cohort?`,
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().pipe(
      map(result => !!result),
      catchError(() => of(false))
    ).subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.loading.set(true);
      this.uploadService.deleteFile(this.cohortId, file.id).pipe(
        finalize(() => this.loading.set(false)),
      ).subscribe(() => this.location.back());
    });
  }

  public convertStatus(status?: ImportStatusEnum): StatusBadeType {
    if (!status) {
      return 'INIT';
    }
    if (status.toUpperCase() === 'ERROR') return 'FAILED';
    if (status.toUpperCase() === 'FINISHED') return 'SUCCESS';
    return 'RUNNING';
  }

  private toSheetView(sheetInfo: ConnectorFileUploadInfoDTO, index: number): ConnectorFileSheetView {
    const rows = this.parseSheetRows(sheetInfo.json);
    const columns = sheetInfo.columns?.length ? sheetInfo.columns : Object.keys(rows[0] ?? {});
    const columnProfiles = sheetInfo.columnProfiles ?? [];

    return {
      name: sheetInfo.sheet || `Sheet ${index + 1}`,
      rows,
      columns,
      columnProfiles,
      rowsScanned: this.getRowsScanned(rows, columnProfiles),
      missingValues: columnProfiles.reduce((sum, profile) => sum + (profile.missing ?? 0), 0),
    };
  }

  private parseSheetRows(json: string | undefined): Record<string, unknown>[] {
    if (!json) {
      return [];
    }

    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * The rows the statistics were taken over.
   *
   * <p>A column's {@code count} is the rows the scan saw, empty ones included - {@code missing} says
   * how many of those were empty, not how many more there were. Adding the two counted every gap
   * twice, which on a file with a sparse column reported more rows than it has.</p>
   */
  private getRowsScanned(rows: Record<string, unknown>[], columnProfiles: ColumnProfile[]): number {
    const scanned = columnProfiles.reduce((max, profile) => Math.max(max, profile.count ?? 0), 0);
    return scanned || rows.length;
  }
}

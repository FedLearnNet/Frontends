import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Subscription} from "rxjs";
import {
  DataExportConfigComponent
} from "@shared-lib/modules/data-modeler/components/data-export-config/data-export-config.component";
import {
  AppExportRunCardComponent
} from "@shared-lib/modules/data-modeler/components/app-export-run-card/app-export-run-card.component";
import {
  AppExportHistoryComponent
} from "@shared-lib/modules/data-modeler/components/app-export-history/app-export-history.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MatIcon} from "@angular/material/icon";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";
import {CohortDto} from "@local-app/cohort/models";
import {PatientDto} from "../../../../../../../local-app/src/app/modules/patient/dto/patient";
import {
  PatientDataExportService
} from "../../../../../../../local-app/src/app/modules/patient/service/patient-export.service";
import {
  isTerminalRunStatus,
  PatientToolRunOutputDTO,
  PatientToolRunStatus,
  PatientToolRunSummaryDTO
} from "../../../../../../../local-app/src/app/modules/patient/dto/patient-tool-run";
import {PatientDataExportConfigDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";

interface DataExportConfig {
  cohort?: CohortDto;
  patient?: PatientDto;
}


export interface PatientFilterOption {
  id?: number;
  externalPatientId: string;
}

const MAX_LOGS = 500;


@Component({
  selector: 'lib-data-export-config-dialog',
  imports: [
    DataExportConfigComponent,
    AppExportRunCardComponent,
    AppExportHistoryComponent,
    CloseableDialogTitleComponent,
    MatIcon,
    MatDialogActions,
    MatDialogContent,
    BtnComponent,
    SseRefreshBtnComponent,
    EmptyStateComponent,
  ],
  templateUrl: './data-export-config-dialog.component.html',
  styleUrl: './data-export-config-dialog.component.scss',
})
export class DataExportConfigDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DataExportConfigDialogComponent>);
  private readonly data: DataExportConfig = inject<DataExportConfig>(MAT_DIALOG_DATA);
  private readonly exportService: PatientDataExportService = inject(PatientDataExportService);
  private readonly destroyRef = inject(DestroyRef);

  exportConfig = signal<PatientDataExportConfigDTO>({} as PatientDataExportConfigDTO);

  patientOptions = signal<PatientFilterOption[]>([]);
  patientOptionsTruncated = signal<boolean>(false);

  // The app-based export started from this dialog
  runId = signal<number | null>(null);
  runStatus = signal<PatientToolRunStatus | null>(null);
  runProgress = signal<number | null>(null);
  runOutputs = signal<PatientToolRunOutputDTO[]>([]);
  runError = signal<string | null>(null);
  runLogs = signal<RunMessageLogDTO[]>([]);
  runStartedAt = signal<Date | null>(null);
  runEndedAt = signal<Date | null>(null);
  downloadReady = signal<boolean>(false);
  streaming = signal<boolean>(false);

  // Earlier app-based exports of the cohort
  history = signal<PatientToolRunSummaryDTO[]>([]);
  historyLoading = signal<boolean>(false);
  historyError = signal<string | null>(null);
  downloadingRunId = signal<number | null>(null);

  isRunning = computed(() => this.streaming() && !isTerminalRunStatus(this.runStatus() ?? undefined));
  hasRun = computed(() => this.streaming() || this.runStatus() !== null || this.runError() !== null);
  canExport = computed(() => {
    const config = this.exportConfig();
    if (this.isRunning()) {
      return false;
    }
    return !config.appBased || !!config.globalAppVersionId;
  });

  private static readonly PATIENT_OPTION_LIMIT = 1000;
  private runSubscription?: Subscription;
  // Lines created in the dialog itself get negative ids, so they never collide with stored ones
  private localLogId = 0;

  ngOnInit(): void {
    const cohort = this.data.cohort;
    if (!cohort) {
      return;
    }
    const limit = DataExportConfigDialogComponent.PATIENT_OPTION_LIMIT;
    this.exportService.listPatientReferences(cohort.id, limit).subscribe(patients => {
      this.patientOptions.set(patients);
      this.patientOptionsTruncated.set(patients.length >= limit);
    });
    this.loadHistory();
  }

  isCohortExport(): boolean {
    return !!this.data.cohort;
  }

  getDialogTitle() {
    if (this.data.cohort) {
      return this.data.cohort.name + " Export";
    }
    if (this.data.patient) {
      return this.data.patient.externalPatientId + " Export";
    }
    return "Export";
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  onExport() {
    const config = this.exportConfig();
    if (!config || !this.canExport()) {
      return;
    }
    if (this.data.cohort && config.appBased) {
      this.startAppExport(this.data.cohort.id, config);
      return;
    }
    if (this.data.cohort) {
      this.exportService.exportCohortPatientData(this.data.cohort.id, config).subscribe(data => {
        data.click();
      });
    }
    if (this.data.patient) {
      this.exportService.exportSinglePatientData(this.data.patient.cohortId, this.data.patient.id, config).subscribe(data => {
        data.click();
      });
    }
  }

  loadHistory(): void {
    const cohort = this.data.cohort;
    if (!cohort) {
      return;
    }
    this.historyLoading.set(true);
    this.historyError.set(null);
    this.exportService.listAppExports(cohort.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: runs => {
        this.history.set(runs);
        this.historyLoading.set(false);
      },
      error: err => {
        this.historyError.set(err?.error?.message ?? err?.message ?? 'Could not load the previous exports');
        this.historyLoading.set(false);
      },
    });
  }

  downloadRun(runId: number | null): void {
    const cohort = this.data.cohort;
    if (!cohort || runId === null) {
      return;
    }
    this.downloadingRunId.set(runId);
    this.exportService.downloadAppExport(cohort.id, runId).subscribe({
      next: link => {
        link.click();
        this.downloadingRunId.set(null);
      },
      error: err => {
        this.downloadingRunId.set(null);
        this.historyError.set(err?.error?.message ?? err?.message ?? 'The download failed');
      },
    });
  }

  private startAppExport(cohortId: number, config: PatientDataExportConfigDTO): void {
    this.runSubscription?.unsubscribe();
    this.runId.set(null);
    this.runStatus.set(null);
    this.runProgress.set(null);
    this.runOutputs.set([]);
    this.runError.set(null);
    this.runLogs.set([]);
    this.downloadReady.set(false);
    this.streaming.set(true);
    this.runStartedAt.set(new Date());
    this.runEndedAt.set(null);
    this.addLocalLog('Export requested, opening the progress stream');

    this.runSubscription = this.exportService.streamAppExport(cohortId, config).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: event => {
        if (event.runId !== undefined && event.runId !== null) {
          this.runId.set(event.runId);
        }
        const status = event.status;
        if (status?.runStatus) {
          this.runStatus.set(status.runStatus);
          this.runProgress.set(status.progress ?? null);
        }
        this.addLogs(event.logs ?? []);
        if (status?.runStatus === 'ERROR') {
          this.runError.set(status.lastError || 'The export app failed');
        }
        if (status?.runStatus === 'FINISHED') {
          this.runOutputs.set(event.outputs ?? []);
          this.downloadReady.set(event.downloadReady);
          if (event.downloadReady) {
            this.downloadRun(this.runId());
          }
        }
        if (isTerminalRunStatus(status?.runStatus)) {
          this.runEndedAt.set(new Date());
          this.loadHistory();
        }
      },
      error: err => {
        this.streaming.set(false);
        this.runEndedAt.set(new Date());
        this.runError.set(err?.error?.message ?? err?.message ?? 'The export stream was interrupted');
      },
      complete: () => this.streaming.set(false),
    });
  }

  private addLogs(logs: RunMessageLogDTO[]): void {
    const incoming = logs
      .filter(log => !!log.message)
      .map(log => log.id === undefined || log.id === null ? {...log, id: --this.localLogId} : log);
    if (incoming.length === 0) {
      return;
    }
    this.runLogs.update(current => {
      const known = new Set(current.map(log => log.id));
      return [...current, ...incoming.filter(log => !known.has(log.id))].slice(-MAX_LOGS);
    });
  }

  private addLocalLog(message: string): void {
    this.addLogs([{
      message,
      severity: 'INFO',
      process: 'browser',
      createdAt: new Date().toISOString(),
    } as unknown as RunMessageLogDTO]);
  }
}

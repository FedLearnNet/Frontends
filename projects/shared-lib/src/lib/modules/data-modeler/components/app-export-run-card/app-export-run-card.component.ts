import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatProgressBar} from "@angular/material/progress-bar";
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {ProgressStepsComponent} from "@shared-lib/components/progress-steps/progress-steps.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {RunLogsListComponent} from "@shared-lib/modules/experiments/components/run-logs-list/run-logs-list.component";
import {RunMessageLogDTO} from "@shared-lib/modules/experiments/dto/log";
import {BytesPipe} from "@shared-lib/pipies/bytes.pipe";
import {
  APP_EXPORT_STATUS_BADGES,
  APP_EXPORT_STATUS_TEXT
} from "@shared-lib/modules/data-modeler/utils/app-export-status.util";
import {
  PatientToolRunOutputDTO,
  PatientToolRunStatus
} from "../../../../../../../local-app/src/app/modules/patient/dto/patient-tool-run";

/** The phases an app-based export passes through. */
const STEPS = ['Prepare data', 'Start app', 'Run app', 'Outputs'];

/** The app-based export that is running or has just finished: status, phases, logs and outputs. */
@Component({
  selector: 'lib-app-export-run-card',
  imports: [
    MatProgressBar,
    StatusBadgeComponent,
    TimeBadgeComponent,
    ProgressStepsComponent,
    ErrorCardComponent,
    BadgeComponent,
    BtnComponent,
    RunLogsListComponent,
    BytesPipe,
  ],
  templateUrl: './app-export-run-card.component.html',
  styleUrl: './app-export-run-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppExportRunCardComponent {
  runId = input<number | null>(null);
  status = input<PatientToolRunStatus | null>(null);
  progress = input<number | null>(null);
  error = input<string | null>(null);
  logs = input<RunMessageLogDTO[]>([]);
  outputs = input<PatientToolRunOutputDTO[]>([]);
  startedAt = input<Date | null>(null);
  endedAt = input<Date | null>(null);
  running = input<boolean>(false);
  downloadReady = input<boolean>(false);
  downloading = input<boolean>(false);

  download = output<void>();

  readonly steps = STEPS;
  private lastActiveStep = 0;

  failed = computed(() => {
    const status = this.status();
    return status === 'ERROR' || status === 'STOPPED' || (!!this.error() && !this.running());
  });

  statusBadge = computed<StatusBadeType>(() => {
    const status = this.status();
    if (this.failed() && (!status || status === 'PENDING')) {
      return 'FAILED';
    }
    return status ? APP_EXPORT_STATUS_BADGES[status] : 'PENDING';
  });

  statusText = computed(() => {
    const status = this.status();
    if (this.failed() && (!status || status === 'PENDING')) {
      return APP_EXPORT_STATUS_TEXT.ERROR;
    }
    return status ? APP_EXPORT_STATUS_TEXT[status] : APP_EXPORT_STATUS_TEXT.PENDING;
  });

  /** The phase the run is in; a failed run stays on the phase it failed in. */
  stepIndex = computed(() => {
    const status = this.status();
    if (status === 'FINISHED') {
      return STEPS.length;
    }
    if (this.failed()) {
      return this.lastActiveStep;
    }
    const step = this.runId() === null ? 0 : status === 'RUNNING' ? 2 : 1;
    this.lastActiveStep = step;
    return step;
  });

  determinate = computed(() => {
    const progress = this.progress();
    return progress !== null && progress > 0 && progress < 1;
  });

  outputIcon(output: PatientToolRunOutputDTO): string {
    switch (output.type) {
      case 'HTML':
        return 'insert_chart';
      case 'CSV':
      case 'TSV':
        return 'table_chart';
      case 'IMAGE':
        return 'image';
      case 'JSON':
        return 'data_object';
      default:
        return 'description';
    }
  }
}

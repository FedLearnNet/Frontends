import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatTooltip} from "@angular/material/tooltip";
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {BytesPipe} from "@shared-lib/pipies/bytes.pipe";
import {APP_EXPORT_STATUS_BADGES} from "@shared-lib/modules/data-modeler/utils/app-export-status.util";
import {PatientToolRunStatus} from "../../../../../../../local-app/src/app/modules/patient/dto/patient-tool-run";
import {errorOf, ExecutionRunDetailDTO, outputsOf} from "@shared-lib/modules/app-execution/dto/execution-run";

/** Earlier app-based exports of a cohort, each downloadable again. */
@Component({
  selector: 'lib-app-export-history',
  imports: [
    MatProgressBar,
    MatTooltip,
    StatusBadgeComponent,
    TimeBadgeComponent,
    InfoCardComponent,
    BtnComponent,
    EmptyStateComponent,
    BytesPipe,
  ],
  templateUrl: './app-export-history.component.html',
  styleUrl: './app-export-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppExportHistoryComponent {
  runs = input<ExecutionRunDetailDTO[]>([]);
  loading = input<boolean>(false);
  error = input<string | null>(null);
  downloadingRunId = input<number | null>(null);

  download = output<number>();

  badge(run: ExecutionRunDetailDTO): StatusBadeType {
    return APP_EXPORT_STATUS_BADGES[run.status as PatientToolRunStatus] ?? 'PENDING';
  }

  appName(run: ExecutionRunDetailDTO): string {
    return run.name || 'Export app';
  }

  outputSize(run: ExecutionRunDetailDTO): number {
    return outputsOf(run).reduce((size, output) => size + (output.file?.size ?? 0), 0);
  }

  hasOutputs(run: ExecutionRunDetailDTO): boolean {
    return outputsOf(run).length > 0;
  }

  protected readonly errorOf = errorOf;
}

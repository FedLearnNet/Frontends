import { Component, inject, signal, ViewChild, input } from '@angular/core';
import { MatPaginator } from "@angular/material/paginator";
import { LoadLogData } from '../../../../../logs/model/log-wrapper';
import { LogPage } from '../../../../../logs/dto/page';
import { LogService } from '../../../../../logs/services/log-service';
import { AuditFieldEnum, FilterKeys } from '../../../../../logs/services/log-service-filter-dto';
import { PatientDataTraceabilityLogDto } from '../../../../../logs/dto/logs';
import {
  PatientUpdateLogDetailComponent
} from '../../../../../logs/components/patient-update-log-detail/patient-update-log-detail.component';
import { MatDialog } from '@angular/material/dialog';
import { GeneralLogTableComponent } from '../../../../../logs/components/general-log-table/general-log-table.component';

@Component({
    selector: 'app-run-change-log',
    templateUrl: './run-change-log.component.html',
    styleUrl: './run-change-log.component.scss',
    imports: [GeneralLogTableComponent]
})
export class RunConnectorChangeLogComponent {
  pageSize = signal<number>(25);

  public data: LogPage<PatientDataTraceabilityLogDto>;

  protected readonly displayedColumns: string[] = ['actions', 'createdAt', 'patientId', 'committed', 'dryRun', 'userId'];

  private readonly logService = inject(LogService);
  private readonly dialog = inject(MatDialog);

  readonly runId = input<number>();
  readonly cohortId = input<string>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  loadData(info: LoadLogData) {
    this.loadPatientDataTraceabilityLogs({
      page: info.page,
      size: info?.pageSize ?? this.pageSize(),
    });
  }

  openDetail(selectedId: number | string) {
    this.dialog.open(PatientUpdateLogDetailComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: this.data.results.find(d => d.id === selectedId),
    });
  }

  private loadPatientDataTraceabilityLogs(overrides?: Partial<{
    page: number;
    size: number;
    sort: AuditFieldEnum;
    order: 'asc' | 'desc';
    search?: string | string[];
    filter?: Partial<Record<FilterKeys, string>>;
    cohortId?: number;
  }>): void {

    const runId = this.runId();
    const defaultParams = {
      page: 0,
      size: this.pageSize(),
      sort: AuditFieldEnum.REVISION_TIMESTAMP,
      order: 'desc' as const,
      filter: runId ? { runId: runId.toString() } : undefined,
    };

    const params = { ...defaultParams, ...overrides };

    this.logService.getPatientDataTraceabilityLog(
        params.page,
        params.size,
        params.sort,
        params.order,
        params.cohortId,
        params.search,
        params.filter
    ).subscribe({
      next: (response) => (this.data = response),
    });
  }
}

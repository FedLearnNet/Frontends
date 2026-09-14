import {Component, inject, input} from '@angular/core';
import {GeneralLogTableComponent} from "../general-log-table/general-log-table.component";
import {LogPage} from "../../dto/page";
import {LogService} from "../../services/log-service";
import {PatientDataTraceabilityLogDto} from "../../dto/logs";
import {LoadLogData, LoadLogDataResponse} from "../../model/log-wrapper";
import {MatDialog} from "@angular/material/dialog";
import {PatientUpdateLogDetailComponent} from "../patient-update-log-detail/patient-update-log-detail.component";
import {AuditFieldEnum} from "../../services/log-service-filter-dto";

@Component({
  selector: 'app-patient-update-log',
  imports: [
    GeneralLogTableComponent
  ],
  templateUrl: './patient-update-log.component.html',
  styleUrl: './patient-update-log.component.scss'
})
export class PatientUpdateLogComponent implements LoadLogDataResponse {
  private readonly logService: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);

  pageSize = input<number>(25);

  displayedColumns: string[] = ['actions', 'createdAt', 'patientId', 'committed', 'dryRun', 'runId', 'connectorId', "userId"];
  filters: string[] = ['By User', "By Connector", 'Commited', "Dry Run"];

  public data: LogPage<PatientDataTraceabilityLogDto>;

  public loadData(info: LoadLogData): void {
    const filter: Partial<Record<'externalPatientId' | 'keycloakId' | 'connectorId' | 'runId' | 'revisionType', string>> = {};

    if (info.filters?.length) {
      for (const f of info.filters) {
        switch (f) {
          case 'By User':
            filter.keycloakId = info.search;
            break;
          case 'By Connector':
            filter.connectorId = info.search;
            break;
          case 'Committed':
            filter.revisionType = 'COMMITTED';
            break;
          case 'Dry Run':
            filter.revisionType = 'DRY_RUN';
            break;
        }
      }
    }

    this.logService.getPatientDataTraceabilityLog(
        info.page ?? 0,
        info.pageSize ?? this.pageSize(),
        AuditFieldEnum.REVISION_TIMESTAMP,
        'desc',
        undefined,
        undefined,
        filter,
    ).subscribe({
      next: (data) => (this.data = data),
    });
  }

  openDetail(id: number | string) {
    const data = this.data.results.find(d => d.id === id)
    this.dialog.open(PatientUpdateLogDetailComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: data
    });
  }
}

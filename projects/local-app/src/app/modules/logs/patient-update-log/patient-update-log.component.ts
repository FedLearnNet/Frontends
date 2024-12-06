import {Component, inject, Input} from '@angular/core';
import {GeneralLogTableComponent} from "../general-log-table/general-log-table.component";
import {SortDirection} from "@angular/material/sort";
import {EMPTY, Observable, of} from "rxjs";
import {LogPage} from "../dto/page";
import {LogService} from "../services/log-service";
import {PatientDataTraceabilityLogDto} from "../dto/logs";
import {LoadLogData, LoadLogDataResponse} from "../model/log-wrapper";
import {AsyncPipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {PatientUpdateLogDetailComponent} from "../patient-update-log-detail/patient-update-log-detail.component";

@Component({
  selector: 'app-patient-update-log',
  standalone: true,
  imports: [
    GeneralLogTableComponent,
    AsyncPipe
  ],
  templateUrl: './patient-update-log.component.html',
  styleUrl: './patient-update-log.component.scss'
})
export class PatientUpdateLogComponent implements LoadLogDataResponse {
  private readonly logService: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);
  @Input() pageSize: number = 25;

  displayedColumns: string[] = ['id', 'createdAt', 'patientId', 'committed', 'dryRun', 'runId', 'connectorId', "userId"];
  filters: string[] = ['By User', "By Connector", 'Commited', "Dry Run"];

  public data: LogPage<PatientDataTraceabilityLogDto>;

  public loadData(info: LoadLogData) {
    const filter: { [key: string]: string } = {};
    if (info.filters && info.filters.length > 0) {
      info.filters.forEach((f, index) => {
        if (f === 'By User') {
          filter['user_id__isnull'] = "False";
        }
        if (f === 'By Connector') {
          filter['connector_id__isnull'] = "False";
        }
        if (f === 'Commited') {
          filter['committed'] = "True";
        }
        if (f === 'Dry Run') {
          filter['dry_run'] = "True";
        }
      });
    }
    this.logService.getPatientDataTraceabilityLog(
      info.sort,
      info.order,
      info.page,
      info.pageSize ?? this.pageSize,
      info.search ?? '',
      filter).subscribe(data => {
      this.data = data;
    })
  }

  openDetail(id: string) {
    this.dialog.open(PatientUpdateLogDetailComponent, {
      data: this.data.results.find(d => d.id === id)
    });
  }
}

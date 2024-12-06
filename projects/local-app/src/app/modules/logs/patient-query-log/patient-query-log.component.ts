import {Component, inject, Input, OnInit} from '@angular/core';
import {GeneralLogTableComponent} from "../general-log-table/general-log-table.component";
import {LoadLogData, LoadLogDataResponse} from "../model/log-wrapper";
import {LogService} from "../services/log-service";
import {MatDialog} from "@angular/material/dialog";
import {LogPage} from "../dto/page";
import {PatientDataTraceabilityLogDto, PatientQueryLogDto} from "../dto/logs";
import {PatientUpdateLogDetailComponent} from "../patient-update-log-detail/patient-update-log-detail.component";
import {QueryInfoDto} from "../dto/query";
import {PatientQueryLogDetailComponent} from "../patient-query-log-detail/patient-query-log-detail.component";

@Component({
  selector: 'app-patient-query-log',
  standalone: true,
  imports: [
    GeneralLogTableComponent
  ],
  templateUrl: './patient-query-log.component.html',
  styleUrl: './patient-query-log.component.scss'
})
export class PatientQueryLogComponent implements OnInit, LoadLogDataResponse {
  private readonly logService: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);
  @Input() pageSize: number = 25;

  displayedColumns: string[] = ['id', 'createdAt', 'cohortId', 'patientId', 'queryId'];

  public data: LogPage<PatientQueryLogDto>;

  private queries: QueryInfoDto[] = [];

  ngOnInit() {
    this.logService.getQueryInfos().subscribe(data => {
      this.queries = data;
    });
  }

  public loadData(info: LoadLogData) {
    this.logService.getPatientQueryLog(
      info.sort,
      info.order,
      info.page,
      info.pageSize ?? this.pageSize,
      info.search).subscribe(data => {
      this.data = data;
    })
  }

  openDetail(id: string) {
    const queryPatient = this.data.results.find(d => d.id === id)
    if (queryPatient) {
      this.dialog.open(PatientQueryLogDetailComponent, {
        data: this.queries.find(q => q.queryId === queryPatient.queryId)
      });
    }
  }

}

import {Component, inject, input, OnInit} from '@angular/core';
import {GeneralLogTableComponent} from "../general-log-table/general-log-table.component";
import {LoadLogData, LoadLogDataResponse} from "../../model/log-wrapper";
import {LogService} from "../../services/log-service";
import {MatDialog} from "@angular/material/dialog";
import {LogPage} from "../../dto/page";
import {PatientQueryLogDto} from "../../dto/logs";
import {LocalQueryDto} from "../../dto/query";
import {
  QueryLogDetailDialogComponent
} from "../../../query/components/query-log-detail-dialog/query-log-detail-dialog.component";

@Component({
  selector: 'app-patient-query-log',
  imports: [
    GeneralLogTableComponent
  ],
  templateUrl: './patient-query-log.component.html',
  styleUrl: './patient-query-log.component.scss'
})
export class PatientQueryLogComponent implements OnInit, LoadLogDataResponse {
  private readonly logService: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);
  pageSize = input<number>(25);

  displayedColumns: string[] = ['actions', 'createdAt', 'cohortId', 'patientId', 'queryId'];

  public data: LogPage<PatientQueryLogDto>;

  private queries: LocalQueryDto[] = [];

  ngOnInit() {
    this.logService.getQueryInfos().subscribe(data => {
      this.queries = data;
    });
  }

  public loadData(info: LoadLogData) {
    this.logService.getPatientQueryLog(
      info.sort!,
      info.order!,
      info.page!,
      info.pageSize ?? this.pageSize(),
      info.search).subscribe(data => {
      this.data = data;
    })
  }

  openDetail(id: number | string) {
    const queryPatient = this.data.results.find(d => d.id === id);
    if (!queryPatient) {
      return;
    }
    const query = this.queries.find(q => q.globalQueryId === queryPatient?.queryId);
    if (query) {
      this.dialog.open(QueryLogDetailDialogComponent, {
        height: '80vh',
        width: '90vw',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: query
      });
    }
  }

}

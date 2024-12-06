import {Component, inject, Input} from '@angular/core';
import {GeneralLogTableComponent} from "../general-log-table/general-log-table.component";
import {LoadLogData, LoadLogDataResponse} from "../model/log-wrapper";
import {LogService} from "../services/log-service";
import {MatDialog} from "@angular/material/dialog";
import {LogPage} from "../dto/page";
import {PatientLearningQuery} from "../dto/logs";

@Component({
  selector: 'app-patient-learning-log',
  standalone: true,
  imports: [
    GeneralLogTableComponent
  ],
  templateUrl: './patient-learning-log.component.html',
  styleUrl: './patient-learning-log.component.scss'
})
export class PatientLearningLogComponent implements LoadLogDataResponse {
  private readonly logService: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);
  @Input() pageSize: number = 25;

  displayedColumns: string[] = ['patientId', 'cohortId'];
  //TODO: Add filters
  filters: string[] = [];

  public data: LogPage<PatientLearningQuery>;

  public loadData(info: LoadLogData) {
    this.logService.getPatientDataLearningLog(
      info.sort,
      info.order,
      info.page,
      info.pageSize ?? this.pageSize,
      info.search,
      undefined).subscribe(data => {
      this.data = data;
    })
  }

  openDetail(id: string) {
    //TODO: Implement
  }

}

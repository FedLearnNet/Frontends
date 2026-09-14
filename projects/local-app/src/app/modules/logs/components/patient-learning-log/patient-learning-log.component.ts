import {Component, inject, input} from '@angular/core';
import {GeneralLogTableComponent} from "../general-log-table/general-log-table.component";
import {LoadLogData, LoadLogDataResponse} from "../../model/log-wrapper";
import {LogService} from "../../services/log-service";
import {LogPage} from "../../dto/page";
import {PatientLearningDto} from "@local-app/data-review/dto/federated-learning-request";
import {Router} from "@angular/router";

@Component({
  selector: 'app-patient-learning-log',
  imports: [
    GeneralLogTableComponent
  ],
  templateUrl: './patient-learning-log.component.html',
  styleUrl: './patient-learning-log.component.scss'
})
export class PatientLearningLogComponent implements LoadLogDataResponse {
  private readonly logService: LogService = inject(LogService);
  private readonly router: Router = inject(Router);

  pageSize = input<number>(25);

  displayedColumns: string[] = ['actions','projectName', 'cohortName', 'externalPatientId'];
  //TODO: Add filters
  filters: string[] = [];

  public data: LogPage<PatientLearningDto>;

  public loadData(info: LoadLogData) {
    this.logService.getPatientDataLearningLog(info).subscribe(data => {
      this.data = data;
    })
  }

  openDetail(id: number | string) {
    this.router.navigate(['/training/overview', id]);
  }

}

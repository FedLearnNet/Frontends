import {Component, inject, input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CohortDto} from '@local-app/cohort/models';
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {StatisticsRequestDetailComponent} from '@local-app/data-review/components/statistics-request-detail/statistics-request-detail.component';
import {FederatedLearningRequestStatus} from '@local-app/data-review/dto/federated-learning-request';
import {RequestDataStatisticsDto} from '@local-app/data-review/dto/request-data-statistics';
import {StatisticsRequestService} from '@local-app/data-review/services/statistics-request.service';
import {LogPage} from '../../dto/page';
import {LoadLogData, LoadLogDataResponse} from '../../model/log-wrapper';
import {GeneralLogTableComponent} from '../general-log-table/general-log-table.component';

@Component({
  selector: 'app-statistics-access-log',
  imports: [GeneralLogTableComponent],
  templateUrl: './statistics-access-log.component.html',
  styleUrl: './statistics-access-log.component.scss',
})
export class StatisticsAccessLogComponent implements LoadLogDataResponse, OnInit {
  private readonly statisticsRequestService = inject(StatisticsRequestService);
  private readonly cohortService = inject(CohortService);
  private readonly dialog = inject(MatDialog);

  pageSize = input(25);

  displayedColumns = ['actions', 'createdAt', 'queryId', 'status', 'requestKeycloakId'];
  filters = ['Pending', 'Approved', 'Rejected', 'Running', 'Completed'];

  data: LogPage<RequestDataStatisticsDto>;
  cohorts: CohortDto[] = [];

  ngOnInit(): void {
    this.cohortService.getCohorts().subscribe({
      next: (cohorts) => this.cohorts = cohorts,
    });
  }

  loadData(info: LoadLogData): void {
    const selectedStatus = info.filters?.[0]?.toUpperCase() as FederatedLearningRequestStatus | undefined;
    this.statisticsRequestService.getAllRequests(
      info.page ?? 0,
      info.pageSize ?? this.pageSize(),
      selectedStatus,
    ).subscribe({
      next: (data) => this.data = data,
    });
  }

  openDetail(id: number | string): void {
    const request = this.data.results.find(item => item.id === id);
    if (!request) {
      return;
    }

    this.dialog.open(StatisticsRequestDetailComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {request, cohorts: this.cohorts, readOnly: true},
    });
  }
}

import {animate, style, transition, trigger} from '@angular/animations';
import {DatePipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {MatProgressBar} from '@angular/material/progress-bar';
import {CohortDto} from '@local-app/cohort/models';
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {StatisticsRequestDetailComponent} from '@local-app/data-review/components/statistics-request-detail/statistics-request-detail.component';
import {FederatedLearningRequestStatus} from '@local-app/data-review/dto/federated-learning-request';
import {RequestDataStatisticsDto} from '@local-app/data-review/dto/request-data-statistics';
import {StatisticsRequestService} from '@local-app/data-review/services/statistics-request.service';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {StatusBadeType, StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {fromEvent} from 'rxjs';
import {PatientDto} from '../../dto/patient';

@Component({
  selector: 'app-patient-log-statistics',
  imports: [DatePipe, ErrorCardComponent, MatProgressBar, StatusBadgeComponent],
  templateUrl: './patient-log-statistics.component.html',
  styleUrl: './patient-log-statistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('rowIn', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(4px)'}),
        animate('140ms ease-out', style({opacity: 1, transform: 'translateY(0)'})),
      ]),
    ]),
  ],
})
export class PatientLogStatisticsComponent implements OnInit {
  private readonly statisticsRequestService = inject(StatisticsRequestService);
  private readonly cohortService = inject(CohortService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  patient = input.required<PatientDto>();

  items = signal<RequestDataStatisticsDto[]>([]);
  cohorts = signal<CohortDto[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cohortService.getCohorts().subscribe({
      next: (cohorts) => this.cohorts.set(cohorts),
    });

    this.loadRequests();

    fromEvent(window, 'focus')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadRequests(false));
  }

  private loadRequests(showLoading = true): void {
    if (showLoading) {
      this.loading.set(true);
    }
    this.error.set('');

    this.statisticsRequestService.getAllRequests(0, 25, undefined, this.patient().id).subscribe({
      next: (response) => {
        this.items.set(response.results ?? []);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message ?? String(error));
        this.loading.set(false);
      },
    });
  }

  getStatusType(status: FederatedLearningRequestStatus): StatusBadeType {
    switch (status) {
      case FederatedLearningRequestStatus.APPROVED:
      case FederatedLearningRequestStatus.COMPLETED:
        return 'SUCCESS';
      case FederatedLearningRequestStatus.REJECTED:
        return 'FAILED';
      case FederatedLearningRequestStatus.RUNNING:
        return 'RUNNING';
      case FederatedLearningRequestStatus.PENDING:
      default:
        return 'PENDING';
    }
  }

  openDetail(request: RequestDataStatisticsDto): void {
    this.dialog.open(StatisticsRequestDetailComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: {request, cohorts: this.cohorts(), readOnly: true},
    });
  }
}

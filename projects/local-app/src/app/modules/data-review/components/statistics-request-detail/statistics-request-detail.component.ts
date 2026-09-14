import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {TranslatePipe} from "@ngx-translate/core";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {InfoGridComponent} from "@shared-lib/components/info-grid/info-grid.component";
import {InfoItemComponent} from "@shared-lib/components/info-item/info-item.component";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {CohortDto} from "@local-app/cohort/models";
import {RequestDataStatisticsDto} from "@local-app/data-review/dto/request-data-statistics";
import {FederatedLearningRequestStatus} from "@local-app/data-review/dto/federated-learning-request";
import {StatisticsRequestService} from "@local-app/data-review/services/statistics-request.service";
import {LocalQueryDto} from "../../../logs/dto/query";
import {LogService} from "../../../logs/services/log-service";
import {QueryDetailCardComponent} from "@shared-lib/modules/query/query-detail-card/query-detail-card.component";

interface StatisticsRequestDetailData {
  request: RequestDataStatisticsDto;
  cohorts: CohortDto[];
  readOnly?: boolean;
}

@Component({
  selector: 'app-statistics-request-detail',
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDividerModule,
    TranslatePipe,
    CloseableDialogTitleComponent,
    BadgeComponent,
    InfoGridComponent,
    InfoItemComponent,
    SkeletonLoaderComponent,
    StatusBadgeComponent,
    TimeBadgeComponent,
    QueryDetailCardComponent,
    QueryDetailCardComponent
  ],
  templateUrl: './statistics-request-detail.component.html',
  styleUrl: './statistics-request-detail.component.scss'
})
export class StatisticsRequestDetailComponent implements OnInit {
  private readonly dialogRef: MatDialogRef<StatisticsRequestDetailComponent> = inject(MatDialogRef);
  private readonly statisticsRequestService: StatisticsRequestService = inject(StatisticsRequestService);
  private readonly logService: LogService = inject(LogService);

  readonly data = inject<StatisticsRequestDetailData>(MAT_DIALOG_DATA);

  query?: LocalQueryDto;
  isLoadingQuery = false;
  isSubmitting = false;

  protected readonly pendingStatus = FederatedLearningRequestStatus.PENDING;

  ngOnInit(): void {
    if (!this.data.request.queryId) {
      return;
    }

    this.isLoadingQuery = true;
    this.logService.getQueryInfo(this.data.request.queryId).subscribe({
      next: (query) => {
        this.query = query;
        this.isLoadingQuery = false;
      },
      error: () => {
        this.isLoadingQuery = false;
      }
    });
  }

  getRequestCohorts(): CohortDto[] {
    const requestedCohortIds = new Set(this.data.request.cohortIds ?? []);
    return this.data.cohorts.filter(cohort => requestedCohortIds.has(cohort.id));
  }

  getVisiblePatientIds(): number[] {
    return (this.data.request.patientIds ?? []).slice(0, 20);
  }

  getHiddenPatientCount(): number {
    return Math.max((this.data.request.patientIds?.length ?? 0) - this.getVisiblePatientIds().length, 0);
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

  onAccept(): void {
    this.updateStatus(FederatedLearningRequestStatus.APPROVED);
  }

  onReject(): void {
    this.updateStatus(FederatedLearningRequestStatus.REJECTED);
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  private updateStatus(status: FederatedLearningRequestStatus): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.statisticsRequestService.updateRequest(this.data.request, status).subscribe({
      next: (updated) => {
        this.dialogRef.close(updated);
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}

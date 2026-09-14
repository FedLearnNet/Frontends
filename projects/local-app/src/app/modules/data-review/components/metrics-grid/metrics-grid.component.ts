import {AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {XSMALL} from '@shared-lib/constants';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {FederatedLearningRequestStatus} from '@local-app/data-review/dto/federated-learning-request';
import {RequestRunMetricsDto} from '@local-app/data-review/dto/request-run-metrics';
import {RunMetricsRequestService} from '@local-app/data-review/services/run-metrics-request.service';
import {
  MetricsRequestDetailComponent
} from '@local-app/data-review/components/metrics-request-detail/metrics-request-detail.component';

@Component({
  selector: 'app-data-review-metrics-grid',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TranslatePipe,
    MatProgressBar,
    ErrorCardComponent,
    StatusBadgeComponent,
    BadgeComponent,
  ],
  templateUrl: './metrics-grid.component.html',
  styleUrl: './metrics-grid.component.scss',
})
export class MetricsGridComponent implements OnInit, AfterViewInit {
  private readonly dialog = inject(MatDialog);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly responsiveService = inject(ResponsiveService);
  private readonly metricsRequestService = inject(RunMetricsRequestService);
  private readonly destroyRef = inject(DestroyRef);

  readonly INIT_PAGE_SIZE = 20;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isXSmallScreen = false;
  isLoadingResults = false;
  error: string | null = null;

  requests: RequestRunMetricsDto[] = [];
  resultsLength = 0;
  currentPage = 0;
  currentPageSize = this.INIT_PAGE_SIZE;

  displayedColumns: string[] = ['experiment', 'project', 'metrics', 'status', 'date'];

  protected readonly FederatedLearningRequestStatus = FederatedLearningRequestStatus;

  ngOnInit(): void {
    this.responsiveService.getScreenSize()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(screenSize => {
        this.isXSmallScreen = screenSize === XSMALL;
      });

    this.loadRequests();
  }

  ngAfterViewInit(): void {
    if (!this.paginator) return;
    this.paginator.page
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: PageEvent) => {
        this.loadRequests(event.pageIndex, event.pageSize);
      });
  }

  openMetricsRequestDetail(id: number): void {
    const request = this.requests.find(item => item.id === id);
    if (!request) return;

    this.dialog.open(MetricsRequestDetailComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '720px',
      autoFocus: false,
      data: {request},
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated: RequestRunMetricsDto | undefined) => {
        if (updated) {
          this.loadRequests(this.currentPage, this.currentPageSize);
        }
      });
  }

  getStatusBadgeType(status: FederatedLearningRequestStatus) {
    switch (status) {
      case FederatedLearningRequestStatus.APPROVED:
      case FederatedLearningRequestStatus.COMPLETED:
        return 'SUCCESS';
      case FederatedLearningRequestStatus.REJECTED:
        return 'FAILED';
      case FederatedLearningRequestStatus.RUNNING:
        return 'RUNNING';
      default:
        return 'PENDING';
    }
  }

  private loadRequests(page = this.currentPage, pageSize = this.currentPageSize): void {
    this.isLoadingResults = true;
    this.error = null;
    this.currentPage = page;
    this.currentPageSize = pageSize;

    this.metricsRequestService.getAllRequests(page, pageSize, FederatedLearningRequestStatus.PENDING)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.requests = response.results ?? [];
          this.resultsLength = response.totalCount ?? this.requests.length;
          this.isLoadingResults = false;
        },
        error: (err: Error) => {
          this.error = err.message ?? String(err);
          this.isLoadingResults = false;
        },
      });
  }
}

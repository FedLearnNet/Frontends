import {Component, computed, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './metrics-grid.component.scss',
})
export class MetricsGridComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly responsiveService = inject(ResponsiveService);
  private readonly metricsRequestService = inject(RunMetricsRequestService);
  private readonly destroyRef = inject(DestroyRef);

  readonly INIT_PAGE_SIZE = 20;

  private readonly screenSize = toSignal(this.responsiveService.getScreenSize(), {initialValue: ''});

  readonly isXSmallScreen = computed(() => this.screenSize() === XSMALL);
  readonly isLoadingResults = signal(true);
  readonly error = signal<string | null>(null);
  readonly requests = signal<RequestRunMetricsDto[]>([]);
  readonly resultsLength = signal(0);
  readonly paginatorReady = signal(false);
  readonly currentPage = signal(0);
  readonly currentPageSize = signal(this.INIT_PAGE_SIZE);

  displayedColumns: string[] = ['experiment', 'project', 'metrics', 'status', 'date'];

  protected readonly FederatedLearningRequestStatus = FederatedLearningRequestStatus;

  ngOnInit(): void {
    setTimeout(() => this.loadRequests());
  }

  onPage(event: PageEvent): void {
    this.loadRequests(event.pageIndex, event.pageSize);
  }

  openMetricsRequestDetail(id: number): void {
    const request = this.requests().find(item => item.id === id);
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
          this.loadRequests(this.currentPage(), this.currentPageSize());
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

  private loadRequests(page = this.currentPage(), pageSize = this.currentPageSize()): void {
    const nextPage = Math.max(page, 0);
    this.isLoadingResults.set(true);
    this.error.set(null);
    this.currentPage.set(nextPage);
    this.currentPageSize.set(pageSize);

    this.metricsRequestService.getAllRequests(nextPage, pageSize, FederatedLearningRequestStatus.PENDING)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.applyPage(response.results ?? [], response.totalCount),
        error: (err: Error) => {
          this.error.set(err.message ?? String(err));
          this.isLoadingResults.set(false);
        },
      });
  }

  private applyPage(results: RequestRunMetricsDto[], totalCount?: number): void {
    const total = totalCount ?? results.length;
    this.requests.set(results);
    this.isLoadingResults.set(false);
    if (this.paginatorReady()) {
      this.resultsLength.set(total);
      return;
    }
    setTimeout(() => {
      this.resultsLength.set(total);
      this.paginatorReady.set(true);
    });
  }
}

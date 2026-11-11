import {Component, computed, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {MatDialog} from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatTableModule} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {XSMALL} from '@shared-lib/constants';
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {CohortDto} from "@local-app/cohort/models";
import {FederatedLearningRequestStatus} from "@local-app/data-review/dto/federated-learning-request";
import {RequestDataStatisticsDto} from "@local-app/data-review/dto/request-data-statistics";
import {StatisticsRequestService} from "@local-app/data-review/services/statistics-request.service";
import {
  StatisticsRequestDetailComponent
} from "@local-app/data-review/components/statistics-request-detail/statistics-request-detail.component";

@Component({
  selector: 'app-data-review-statistics-grid',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TranslatePipe,
    MatProgressBar,
    ErrorCardComponent,
  ],
  templateUrl: './statistics-grid.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './statistics-grid.component.scss'
})
export class StatisticsGridComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly statisticsRequestService: StatisticsRequestService = inject(StatisticsRequestService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly INIT_PAGE_SIZE = 20;

  private readonly routeData = toSignal(this.activatedRoute.data, {
    initialValue: this.activatedRoute.snapshot.data as {cohorts?: CohortDto[]},
  });
  private readonly screenSize = toSignal(this.responsiveService.getScreenSize(), {initialValue: ''});

  readonly isXSmallScreen = computed(() => this.screenSize() === XSMALL);
  readonly isLoadingResults = signal(true);
  readonly error = signal<string | null>(null);
  readonly requests = signal<RequestDataStatisticsDto[]>([]);
  readonly cohorts = computed<CohortDto[]>(() => this.routeData().cohorts ?? []);
  readonly resultsLength = signal(0);
  readonly paginatorReady = signal(false);
  readonly currentPage = signal(0);
  readonly currentPageSize = signal(this.INIT_PAGE_SIZE);

  displayedColumns: string[] = ['query', 'requestedData', 'date'];

  ngOnInit(): void {
    setTimeout(() => this.loadRequests());
  }

  onPage(event: PageEvent): void {
    this.loadRequests(event.pageIndex, event.pageSize);
  }

  openStatisticsRequestModal(id: number): void {
    const request = this.requests().find(item => item.id === id);
    if (!request) {
      return;
    }

    this.dialog.open(StatisticsRequestDetailComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        request,
        cohorts: this.cohorts(),
      },
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated: RequestDataStatisticsDto | undefined) => {
        if (updated) {
          this.loadRequests(this.currentPage(), this.currentPageSize());
        }
      });
  }

  getRequestCohorts(request: RequestDataStatisticsDto): CohortDto[] {
    const requestedCohortIds = new Set(request.cohortIds ?? []);
    return this.cohorts().filter(cohort => requestedCohortIds.has(cohort.id));
  }

  private loadRequests(page = this.currentPage(), pageSize = this.currentPageSize()): void {
    const nextPage = Math.max(page, 0);
    this.isLoadingResults.set(true);
    this.error.set(null);
    this.currentPage.set(nextPage);
    this.currentPageSize.set(pageSize);

    this.statisticsRequestService.getAllRequests(
      nextPage,
      pageSize,
      FederatedLearningRequestStatus.PENDING
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.applyPage(response.results ?? [], response.totalCount),
        error: (error: Error) => {
          this.error.set(error.message ?? String(error));
          this.isLoadingResults.set(false);
        }
      });
  }

  private applyPage(results: RequestDataStatisticsDto[], totalCount?: number): void {
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

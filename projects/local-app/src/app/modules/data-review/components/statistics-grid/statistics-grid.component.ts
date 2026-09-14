import {AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from "@angular/common";
import {ActivatedRoute} from '@angular/router';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatDialog} from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
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
  styleUrl: './statistics-grid.component.scss'
})
export class StatisticsGridComponent implements OnInit, AfterViewInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly statisticsRequestService: StatisticsRequestService = inject(StatisticsRequestService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly INIT_PAGE_SIZE = 20;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  isXSmallScreen = false;
  isLoadingResults = false;
  error: string | null = null;

  requests: RequestDataStatisticsDto[] = [];
  cohorts: CohortDto[] = [];
  resultsLength = 0;

  displayedColumns: string[] = ['query', 'requestedData', 'date'];

  currentPage = 0;
  currentPageSize = this.INIT_PAGE_SIZE;

  ngOnInit(): void {
    this.activatedRoute.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({cohorts}) => {
        this.cohorts = cohorts ?? [];
      });

    this.responsiveService.getScreenSize()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(screenSize => {
        this.isXSmallScreen = screenSize === XSMALL;
      });

    this.loadRequests();
  }

  ngAfterViewInit(): void {
    if (!this.paginator) {
      return;
    }

    this.paginator.page
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event: PageEvent) => {
        this.loadRequests(event.pageIndex, event.pageSize);
      });
  }

  openStatisticsRequestModal(id: number): void {
    const request = this.requests.find(item => item.id === id);
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
        cohorts: this.cohorts,
      },
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated: RequestDataStatisticsDto | undefined) => {
        if (updated) {
          this.loadRequests(this.currentPage, this.currentPageSize);
        }
      });
  }

  getRequestCohorts(request: RequestDataStatisticsDto): CohortDto[] {
    const requestedCohortIds = new Set(request.cohortIds ?? []);
    return this.cohorts.filter(cohort => requestedCohortIds.has(cohort.id));
  }

  private loadRequests(page = this.currentPage, pageSize = this.currentPageSize): void {
    this.isLoadingResults = true;
    this.error = null;
    this.currentPage = page;
    this.currentPageSize = pageSize;

    this.statisticsRequestService.getAllRequests(
      page,
      pageSize,
      FederatedLearningRequestStatus.PENDING
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.requests = response.results ?? [];
          this.resultsLength = response.totalCount ?? this.requests.length;
          this.isLoadingResults = false;
        },
        error: (error: Error) => {
          this.error = error.message ?? String(error);
          this.isLoadingResults = false;
        }
      });
  }
}

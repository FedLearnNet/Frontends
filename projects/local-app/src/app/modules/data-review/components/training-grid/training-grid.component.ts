import {AfterViewInit, Component, computed, DestroyRef, inject, OnInit, viewChild} from '@angular/core';
import {MatTable, MatTableModule} from '@angular/material/table';
import {ActivatedRoute} from '@angular/router';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {XSMALL} from '@shared-lib/constants';
import {MatDialog} from '@angular/material/dialog';
import {
  LearningRequestDataSelectorListComponent
} from '../learning-request-data-selector-list/learning-request-data-selector-list.component';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {
  FederatedLearningRequestStatus,
  PatientLearningDto
} from "@local-app/data-review/dto/federated-learning-request";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {startWith} from "rxjs/operators";
import {TranslatePipe} from '@ngx-translate/core';
import {CohortDto} from "@local-app/cohort/models";
import {Store} from "@ngrx/store";
import {TrainingReviewActions} from "@local-app/data-review/store/training-review.actions";
import {selectError, selectItems, selectLoading} from "@local-app/data-review/store/training-review.selectors";
import {MatProgressBar} from "@angular/material/progress-bar";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-data-review-training-grid',
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
  templateUrl: './training-grid.component.html',
  styleUrl: './training-grid.component.scss'
})
export class TrainingGridComponent implements OnInit, AfterViewInit {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly INIT_PAGE_SIZE = 30;
  table = viewChild(MatTable);
  paginator = viewChild(MatPaginator);

  private readonly routeDataSig = toSignal(this.activatedRoute.data, {initialValue: {} as { cohorts?: CohortDto[] }});
  private readonly screenSizeSig = toSignal(
    this.responsiveService.getScreenSize(),
    {initialValue: XSMALL}
  );

  error = this.store.selectSignal(selectError);
  isLoadingResults = this.store.selectSignal(selectLoading);

  isXSmallScreen = computed(() => this.screenSizeSig() === XSMALL);
  trainings = this.store.selectSignal(selectItems);
  cohorts = computed<CohortDto[]>(() => this.routeDataSig().cohorts ?? []);
  resultsLength = computed(() => this.trainings().length);

  displayedColumns: string[] = ['name', 'requestedData', 'date'];

  ngAfterViewInit(): void {
    const pag = this.paginator();
    if (!pag) return;
    pag.page
      .pipe(
        startWith(null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.store.dispatch(TrainingReviewActions.loadPage({
          page: pag.pageIndex ?? 1,
          pageSize: pag.pageSize,
          status: FederatedLearningRequestStatus.PENDING
        }));
      });
  }

  ngOnInit(): void {
    this.store.dispatch(TrainingReviewActions.loadPage({
      page: 1,
      pageSize: this.INIT_PAGE_SIZE,
      status: FederatedLearningRequestStatus.PENDING
    }));
  }

  openLearningRequestModal(id: number): void {
    const request = this.trainings().find(training => training.id === id);
    if (!request) {
      return;
    }
    this.dialog.open(LearningRequestDataSelectorListComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        request: request,
        cohorts: this.cohorts(),
      },
    });
  }

  public getRequestCohorts(requestPatients: PatientLearningDto[]): CohortDto[] {
    const requestedCohortIds = new Set(requestPatients.map(p => p.internalCohortId))
    return this.cohorts().filter(cohort => requestedCohortIds.has(cohort.id));
  }

  public getPatientCountForCohort(requestPatients: PatientLearningDto[], cohortId: number): number {
    return requestPatients.filter(p => p.internalCohortId === cohortId).length;
  }
}

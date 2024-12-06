import {Component, ViewChild, OnInit, inject, AfterViewInit} from '@angular/core';
import {MatTable, MatTableModule} from '@angular/material/table';
import {CohortDetail, Training, TrainingStatus} from '@local-app/data-review/models';
import {TrainingService} from '@local-app/data-review/services/training.service';
import {ActivatedRoute} from '@angular/router';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {XSMALL} from '@shared-lib/constants';
import {MatDialog} from '@angular/material/dialog';
import {
  LearningRequestDataSelectorListComponent
} from '../learning-request-data-selector-list/learning-request-data-selector-list.component';
import {Schema} from '@shared-lib/models';
import {GROUPS_AND_USERS} from '@local-app/data-review/services/mock';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {
  FederatedLearningRequestDto,
  FederatedLearningRequestPatientsDto
} from "@local-app/data-review/dto/federated-learning-request";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {startWith} from "rxjs/operators";
import {map, switchMap} from "rxjs";
import {AppDto} from "@global-app/app-store/dto/app";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-data-review-training-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './training-grid.component.html',
  styleUrl: './training-grid.component.scss',
})
export class TrainingGridComponent implements OnInit, AfterViewInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly trainingService: TrainingService = inject(TrainingService);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);

  @ViewChild(MatTable) table: MatTable<Training>;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  resultsLength = 0;
  isLoadingResults = true;

  isXSmallScreen: boolean = false;
  trainings: FederatedLearningRequestDto[];
  cohorts: Schema[] = [];

  displayedColumns: string[] = ['actions', 'user', 'requestedData', 'description', 'date', 'status'];


  ngOnInit() {
    this.activatedRoute.data.subscribe(({cohorts}) => {
      this.cohorts = cohorts;
    });

    this.checkAndAdjustResponsiveLayout();
  }

  ngAfterViewInit() {

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.trainingService.getAllTrainings(
            this.paginator.pageIndex ?? 1,
            this.paginator.pageSize,
          )
        }),
        map(data => {
          this.isLoadingResults = false;
          if (data === null) {
            return [];
          }
          this.resultsLength = data.count;
          return data.results;
        }),
      )
      .subscribe(data => {
        this.trainings = data
      });
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .getScreenSize()
      .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  acceptTraining(event: Event, trainingId: number) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Accept training',
        message: 'All patients will be accepted',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Accept',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.updateTrainingRequest(trainingId, TrainingStatus.Approved);

    });

  }

  rejectTraining(event: Event, trainingId: number) {
    event.stopPropagation();
    this.updateTrainingRequest(trainingId, TrainingStatus.Rejected);
  }

  updateTrainingRequest(id: number, status: TrainingStatus, updatedRequest?: FederatedLearningRequestPatientsDto[]) {
    return this.trainingService.updateTrainingStatus(id, status, updatedRequest)
      .subscribe(trainingResult => {
        const currentTraining = this.trainings.find(tr => tr.id === id);

        if (!currentTraining) {
          return;
        }

        currentTraining.status = trainingResult.status;
        this.table.renderRows();
      });
  }

  isTrainingPending(status: string): boolean {
    return status === 'Pending';
  }

  openLearningRequestModal(id: number): void {
    const request = this.trainings.find(training => training.id === id);
    if (!request) {
      return;
    }
    const dialogRef = this.dialog.open(LearningRequestDataSelectorListComponent, {
      minWidth: '80%',
      data: {
        request: request,
        cohorts: this.cohorts,
      },
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result?: FederatedLearningRequestPatientsDto[]) => {
      if (result) {

        const acceptedRequest = result.filter(request => request.patientIds.length > 0).length > 0;
        if (acceptedRequest) {
          this.updateTrainingRequest(id, TrainingStatus.Approved, result);
        } else {
          this.updateTrainingRequest(id, TrainingStatus.Rejected);
        }
      }
    });
  }

  getNameForCohort(cohortId: string): string {
    return this.cohorts.find(cohort => cohort.uniqueId === cohortId)?.name ?? '';
  }
}

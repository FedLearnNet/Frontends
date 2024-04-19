import { Component } from '@angular/core';
import { Cohort } from '@local-app/cohort/models';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { SMALL } from '@shared-lib/constants';
import { CohortListItem } from '@local-app/utils/models/cohort-list-item';

@Component({
  selector: 'app-cohort-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class CohortDashboardComponent {
  cohortList: CohortListItem[] = [];
  displayedColumns: string[] = ['actions', 'name', 'description'];
  isLargeScreen: boolean = true;
  screenSize: string;

  constructor(
      public dialog: MatDialog,

      private cohortService: CohortService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({cohorts}) => this.cohortList = cohorts);

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .isScreenSizeGreaterThan(SMALL)
        .subscribe(isLargeScreen => this.isLargeScreen = isLargeScreen);

    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.screenSize = screenSize);
  }

  deleteRow(element: Cohort): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete cohort',
        message: 'Are you sure you want to delete this cohort?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.cohortService.handleDeleteCohort(element.id).subscribe(result => {
        this.cohortList = result;
      });
    });
  }
}

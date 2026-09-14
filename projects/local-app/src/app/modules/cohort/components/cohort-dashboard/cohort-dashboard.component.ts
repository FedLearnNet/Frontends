import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {SMALL} from '@shared-lib/constants';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {CohortDto, isCohortDeleting} from '@local-app/cohort/models';
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {MatIcon} from "@angular/material/icon";
import {MatBadge} from "@angular/material/badge";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-cohort-dashboard',
  templateUrl: './cohort-dashboard.component.html',
  styleUrl: './cohort-dashboard.component.scss',
  imports: [
    MatTableModule,
    MatButtonModule,
    RouterLink,
    TranslatePipe,
    MatIcon,
    MatBadge,
    MatTooltip,
    HeaderComponent,
    StatusBadgeComponent,
    BtnComponent,
  ]
})
export class CohortDashboardComponent implements OnInit, OnDestroy {
  private readonly responsiveService = inject(ResponsiveService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly cohortService = inject(CohortService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  cohorts: CohortDto[] = [];
  displayedColumns: string[] = ['name', 'description', 'amountPatients', 'actions'];
  isLargeScreen: boolean = true;
  screenSize: string;

  private cohortsChangedSub?: Subscription;
  private listPollInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({cohorts}) => {
      this.cohorts = cohorts;
      this.syncListPolling();
    });
    this.cohortsChangedSub = this.cohortService.cohortsChanged.subscribe(() => this.refreshCohorts(false));

    this.checkAndAdjustResponsiveLayout();
  }

  ngOnDestroy(): void {
    this.cohortsChangedSub?.unsubscribe();
    this.stopListPolling();
  }

  isDeleting(cohort: CohortDto): boolean {
    return isCohortDeleting(cohort);
  }

  navigateToConnectors(cohort: CohortDto): void {
    if (this.isDeleting(cohort)) {
      return;
    }
    this.router.navigate([cohort.id, 'connector'], {relativeTo: this.activatedRoute});
  }

  deleteCohort(cohort: CohortDto): void {
    if (this.isDeleting(cohort)) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.DELETE_COHORT.TITLE'),
        message: this.translate.instant('DIALOG.DELETE_COHORT.MESSAGE'),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.DELETE'),
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.cohortService.deleteCohort(cohort.id).subscribe({
        next: () => {
          this.markCohortDeleting(cohort.id);
          this.syncListPolling();
        },
      });
    });
  }

  navigateToNew(): void {
    this.router.navigate(['new'], {relativeTo: this.activatedRoute});
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .isScreenSizeGreaterThan(SMALL)
      .subscribe(isLargeScreen => this.isLargeScreen = isLargeScreen);

    this.responsiveService
      .getScreenSize()
      .subscribe(screenSize => this.screenSize = screenSize);
  }

  private refreshCohorts(showCompletionToast = false): void {
    const deletingBefore = new Set(
      this.cohorts.filter(cohort => isCohortDeleting(cohort)).map(cohort => cohort.id),
    );

    this.cohortService.getCohorts().subscribe(cohorts => {
      const completedIds = [...deletingBefore].filter(id => !cohorts.some(cohort => cohort.id === id));
      if (showCompletionToast && completedIds.length) {
        this.showDeletionSuccessToast();
      }
      this.cohorts = cohorts;
      this.syncListPolling();
    });
  }

  private markCohortDeleting(cohortId: number): void {
    this.cohorts = this.cohorts.map(cohort =>
      cohort.id === cohortId ? {...cohort, deletionInProgress: true} : cohort,
    );
  }

  private syncListPolling(): void {
    if (this.cohorts.some(cohort => isCohortDeleting(cohort))) {
      this.startListPolling();
      return;
    }
    this.stopListPolling();
  }

  private startListPolling(): void {
    if (this.listPollInterval) {
      return;
    }
    this.listPollInterval = setInterval(() => this.refreshCohorts(true), 2500);
  }

  private stopListPolling(): void {
    if (!this.listPollInterval) {
      return;
    }
    clearInterval(this.listPollInterval);
    this.listPollInterval = undefined;
  }

  private showDeletionSuccessToast(): void {
    this.snackBar.open(
      this.translate.instant('COHORT_DELETION.SUCCESS'),
      this.translate.instant('BUTTON.CLOSE'),
      {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      },
    );
  }
}

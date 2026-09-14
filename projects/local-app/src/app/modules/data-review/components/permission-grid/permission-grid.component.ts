import {Component, inject, input, OnInit, ViewChild} from '@angular/core';
import {PermissionDTO} from '@local-app/data-review/models';
import {MatDialog} from '@angular/material/dialog';
import {
  PermissionDetailComponent
} from '@local-app/data-review/components/permission-detail/permission-detail.component';
import {PermissionService} from '@local-app/data-review/services/permission.service';
import {MatTable, MatTableModule} from '@angular/material/table';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {ActivatedRoute} from '@angular/router';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {XSMALL} from '@shared-lib/constants';
import {CohortDetailDto, CohortDto} from '@local-app/cohort/models';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginatorModule} from "@angular/material/paginator";
import {map} from "rxjs";
import {MatTooltipModule} from '@angular/material/tooltip';
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

@Component({
  selector: 'app-data-review-permission-grid',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TranslatePipe,
    MatTooltipModule,
    TimeBadgeComponent,
    HeaderComponent,
    PageWrapperComponent,
  ],
  templateUrl: './permission-grid.component.html',
  styleUrls: ['./permission-grid.component.scss'],
})
export class PermissionGridComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly permissionService: PermissionService = inject(PermissionService);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly translate: TranslateService = inject(TranslateService);

  filterCohort = input<CohortDetailDto | undefined>();
  @ViewChild(MatTable) table: MatTable<PermissionDTO>;

  isXSmallScreen: boolean = false;
  permissions: PermissionDTO[];
  cohorts: CohortDto[];

  displayedColumns: string[] = [
    'actions',
    'cohortName',
    'groupOrUser',
    'isAllowedToQuery',
    'queryRetryTime',
    'querySampleThreshold',
    'autoTrainingAccess',
    'autoStatisticsAccess',
    'autoMetricsAccess',
    'validFrom',
    'validUntil',
    'createdAt',
    'updatedAt',
    // 'permissions', // Include this if you want to display the permissions column
  ];

  ngOnInit() {
    this.activatedRoute.data.subscribe(({permissions, cohorts}) => {
      this.permissions = permissions;
      if (this.filterCohort()) {
        this.cohorts = [this.filterCohort()!];
      } else {
        this.cohorts = cohorts;
      }
      this.refreshPermissions();
    });

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService.getScreenSize().subscribe(
      (screenSize) => (this.isXSmallScreen = screenSize === XSMALL)
    );
  }

  addPermission(): void {
    this.openPermissionDetailDialog();
  }

  editRow(permissionRow: PermissionDTO): void {
    if (!permissionRow.id) return;

    this.permissionService.getPermission(permissionRow.id).subscribe((permission) => {
      this.openPermissionDetailDialog(permission);
    });
  }

  deleteRow(permission: PermissionDTO): void {
    if (!permission.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.DELETE_PERMISSION.TITLE'),
        message: this.translate.instant('DIALOG.DELETE_PERMISSION.MESSAGE'),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.DELETE'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.permissionService.deletePermission(permission.id!).subscribe(() => {
        this.permissions = this.permissions.filter((p) => p.id !== permission.id);
        this.table.renderRows();
      });
    });
  }

  openPermissionDetailDialog(permission?: PermissionDTO | null): void {
    const dialogRef = this.dialog.open(PermissionDetailComponent, {
      data: {
        permission: permission || null,
        cohort: this.filterCohort()
      },
      minWidth: '600px',
    });

    dialogRef.afterClosed().subscribe((updatedPermission) => {
      if (!updatedPermission) return;

      this.refreshPermissions();
    });
  }

  refreshPermissions(): void {
    this.permissionService.getAllPermissions().pipe(
      map(permissions => permissions
        .filter(p => {
          if (this.filterCohort()) {
            return p.cohortId === this.filterCohort()!.id
          }
          return true;
        })
      ),
    ).subscribe((permissions) => {
      this.permissions = permissions;
      this.table.renderRows();
    });
  }

  getCohortName(cohortId: number): string {
    return this.cohorts.find((cohort: CohortDto) => cohort.id === cohortId)?.name ?? '';
  }
}

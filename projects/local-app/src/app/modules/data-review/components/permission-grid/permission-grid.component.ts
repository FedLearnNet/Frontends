import {Component, ViewChild, OnInit, inject} from '@angular/core';
import { Permission } from '@local-app/data-review/models';
import { MatDialog } from '@angular/material/dialog';
import { PermissionDetailComponent } from '@local-app/data-review/components/permission-detail/permission-detail.component';
import { PermissionService } from '@local-app/data-review/services/permission.service';
import { MatTable } from '@angular/material/table';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';

@Component({
  selector: 'app-data-review-permission-grid',
  templateUrl: './permission-grid.component.html',
  styleUrls: ['./permission-grid.component.scss'],
})
export class PermissionGridComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly permissionService: PermissionService = inject(PermissionService);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);

  @ViewChild(MatTable) table: MatTable<Permission>;

  isXSmallScreen: boolean = false;
  permissions: Permission[];

  displayedColumns: string[] = [
    'actions',
    'cohortId',
    'groupOrUser',
    'isAllowedToQuery',
    'queryRetryTime',
    'querySampleThreshold',
    'autoTrainingAccess',
    'createdAt',
    'updatedAt',
    // 'permissions', // Include this if you want to display the permissions column
  ];

  ngOnInit() {
    this.activatedRoute.data.subscribe(({ permissions }) => {
      console.log('Permissions:', permissions);
      this.permissions = permissions;
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

  editRow(permissionRow: Permission): void {
    if (!permissionRow.id) return;

    this.permissionService.getPermission(permissionRow.id).subscribe((permission) => {
      this.openPermissionDetailDialog(permission);
    });
  }

  deleteRow(permission: Permission): void {
    if (!permission.id) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete permission',
        message: 'Are you sure you want to delete this permission?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
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

  openPermissionDetailDialog(permission?: Permission | null): void {
    const dialogRef = this.dialog.open(PermissionDetailComponent, {
      data: permission || null,
      minWidth: '600px',
    });

    dialogRef.afterClosed().subscribe((updatedPermission) => {
      if (!updatedPermission) return;

      this.refreshPermissions();
    });
  }

  refreshPermissions(): void {
    this.permissionService.getAllPermissions().subscribe((permissions) => {
      this.permissions = permissions;
      this.table.renderRows();
    });
  }

  /**
   * Generates a HTML string representation of permission properties for display.
   * @param permission The permission object.
   * @returns A HTML string representing the permission properties.
   */
  getPermissions(permission: Permission): string {
    let permissionLabel = '';

    if (permission.isAllowedToQuery) {
      permissionLabel += `<div class="permissions-cell">Is allowed to query</div>\n`;
    }

    if (permission.queryRetryTime !== null && permission.queryRetryTime !== undefined) {
      permissionLabel += `<div class="permissions-cell">Retry time to query: <span class="disabled-input">${permission.queryRetryTime}</span> seconds</div>\n`;
    }

    if (permission.querySampleThreshold !== null && permission.querySampleThreshold !== undefined) {
      permissionLabel += `<div class="permissions-cell">Query must include at least <span class="disabled-input">${permission.querySampleThreshold}</span> samples</div>\n`;
    }

    if (permission.autoTrainingAccess) {
      permissionLabel += `<div class="permissions-cell">Automatic training access with <span class="disabled-input">${permission.autoTrainingAccess}</span></div>\n`;
    }

    return permissionLabel === '' ? 'None' : permissionLabel;
  }
}

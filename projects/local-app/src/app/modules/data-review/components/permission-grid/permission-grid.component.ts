import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { Application, Group, Permission } from '@local-app/data-review/models';
import { MatDialog } from '@angular/material/dialog';
import { PermissionDetailComponent } from '@local-app/data-review/components/permission-grid/components/permission-detail/permission-detail.component';
import { PermissionService } from '@local-app/data-review/services/permission.service';
import { isNull } from 'lodash';
import { MatTable } from '@angular/material/table';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';

@Component({
  selector: 'app-data-review-permission-grid',
  templateUrl: './permission-grid.component.html',
  styleUrl: './permission-grid.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PermissionGridComponent {
  isXSmallScreen: boolean = false;
  groupsAndUsers: Group[];
  permissions: Permission[];
  applications: Application[];

  displayedColumns: string[] = ['actions', 'cohort', 'groupOrUser', 'permissions'];

  @ViewChild(MatTable) table: MatTable<Permission>;

  constructor(
      public dialog: MatDialog,

      private activatedRoute: ActivatedRoute,
      private permissionService: PermissionService,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(({permissions}) => this.permissions = permissions);

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  addPermission(): void {
    this.openPermissionDetailDialog();
  }

  editRow(permissionRow: Permission): void {
    this.permissionService.getPermission(permissionRow.id)
        .subscribe(permission => this.openPermissionDetailDialog(permission));
  }

  deleteRow(permission: Permission): void {
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

      this.permissionService.deletePermission(permission.id)
          .subscribe(permissionList => {
            this.permissions = permissionList;
            this.table.renderRows();
          });
    });
  }

  getPermissions(permissions: {}): string {
    let permissionLabel = '';
    const permissionLabels: any = {
      querySampleThreshold: 'Query must include at least {{input}} samples',
      specificGroupInterval: 'Query every {{input}} seconds by specific group user',
      anyGroupInterval: 'Query every {{input}} seconds by any group user',
      maxQueryLimit: 'Between 0 and {{input}} added to any query',
      accessWith: 'Automatic training access with {{input}}',
    };

    Object.entries(permissions).forEach(([key, value]) => {
      if (isNull(value)) return;

      const formattedValue = `<span class="disabled-input">${value}</span>`;
      permissionLabel += `<div class="permissions-cell">${permissionLabels[key].replace('{{input}}', formattedValue)}</div>\n`;
    });

    return permissionLabel === '' ? 'None' : permissionLabel;
  }

  openPermissionDetailDialog(permission?: Permission | null): void {
    const dialogRef = this.dialog.open(PermissionDetailComponent, {
      data: {
        permission: permission,
      },
    });

    dialogRef.afterClosed().subscribe((permissionData) => {
      if (!permissionData) return;

      this.submitPermission(permissionData);
    });
  }

  submitPermission(permission: { id: number | undefined, cohort: number[], groupOrUser: number[], permissions: object }): void {
    if (permission.id !== undefined) {
      this.permissionService.updatePermission({
        ...permission,
        cohort: permission.cohort[0],
        groupOrUser: permission.groupOrUser[0],
      } as Permission)
          .subscribe(permissionList => {
            this.permissions = permissionList
            this.table.renderRows();
          });

      return;
    }

    this.permissionService.createPermission(permission.cohort, permission.groupOrUser, permission.permissions)
        .subscribe(permissionList => {
          this.permissions = permissionList
          this.table.renderRows();
        });
  }
}

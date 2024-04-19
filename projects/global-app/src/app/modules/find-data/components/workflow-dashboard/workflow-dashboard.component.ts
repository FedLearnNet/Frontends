import { Component, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { QueryService } from '@global-app/find-data/services/query.service';
import { ActivatedRoute } from '@angular/router';
import { Application, Query, Workflow, WorkflowStatus } from '@global-app/find-data/models';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';

@Component({
  selector: 'app-workflow-dashboard',
  templateUrl: './workflow-dashboard.component.html',
  styleUrl: './workflow-dashboard.component.scss',
})
export class WorkflowDashboardComponent {
  isXSmallScreen: boolean = false;
  query: Query;
  workflowList: Workflow[] = [];
  displayedColumns: string[] = ['actions', 'name', 'description', 'applications', 'status'];

  @ViewChild(MatTable) table: MatTable<Application>;

  constructor(
      public dialog: MatDialog,

      private location: Location,
      private queryService: QueryService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({query}) => {
      this.query = query;
      this.workflowList = query.workflows;
    });

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  onGoBack() {
    this.location.back();
  }

  onDelete(workflowId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete workflow',
        message: 'Are you sure you want to delete this workflow?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.queryService.deleteQueryWorkflow(parseInt(this.activatedRoute.snapshot.params['query-id']), workflowId)
          .subscribe(workflows => this.workflowList = workflows);
    });
  }

  getApplicationsLabel(applications: Application[]): string {
    let applicationsLabel = '';

    applications.forEach(application => applicationsLabel += `${application.name}\n`);

    return applicationsLabel;
  }

  getWorkflowStatus(status: WorkflowStatus): string {
    return WorkflowStatus[status];
  }
}

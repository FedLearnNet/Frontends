import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QueryDetailComponent } from '@global-app/find-data/components/query-detail/query-detail.component';
import { Query, Workflow, WorkflowStatus } from '@global-app/find-data/models';
import { QueryService } from '@global-app/find-data/services/query.service';
import { MatTable } from '@angular/material/table';
import { ConfirmDialogComponent } from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import { isNotNull } from '@shared-lib/utils';
import { isUndefined } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { SMALL, XSMALL } from '@shared-lib/constants';
import { ResponsiveService } from '@shared-lib/services/responsive.service';

@Component({
  selector: 'app-find-data-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class FindDataDashboardComponent {
  screenSize: string;
  isLargeScreen: boolean = true;
  isXSmallScreen: boolean = false;
  queryList: Query[] = [];
  displayedColumns: string[] = ['actions', 'name', 'description', 'queryString', 'result'];

  @ViewChild(MatTable) table: MatTable<Query>;

  constructor(
      public dialog: MatDialog,

      private queryService: QueryService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({queries}) => this.queryList = queries);

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .isScreenSizeGreaterThan(SMALL)
        .subscribe(isLargeScreen => this.isLargeScreen = isLargeScreen);

    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => {
          this.screenSize = screenSize;
          this.isXSmallScreen = screenSize === XSMALL;
        });
  }

  onCreateQuery(): void {
    this.openQueryDetailDialog();
  }

  onRunQuery(queryId: number): void {
    this.queryService.runQuery(queryId)
        .subscribe(queryList => this.queryList = queryList);
  }

  onEditQuery(queryId: number): void {
    this.openQueryDetailDialog(queryId);
  }

  openQueryDetailDialog(queryId?: number): void {
    const dialogRef = this.dialog.open(QueryDetailComponent, {
      minWidth: '60%',
      data: {
        queryData: queryId ? this.queryList.find(query => query.id === queryId) : null,
      },
    });

    dialogRef.afterClosed().subscribe((queryData: Query) => {
      if (!queryData) return;

      if (queryData.id) {
        this.queryService.editQuery(queryData)
            .subscribe(queryList => {
              this.queryList = queryList;
              this.table.renderRows();
            });

        return;
      }

      this.queryService.createQuery(queryData)
          .subscribe(queryList => {
            this.queryList = queryList;
            this.table.renderRows();
          });
    });
  }

  onDeleteQuery(queryId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete query',
        message: 'Are you sure you want to delete this query?',
        dismissButtonText: 'Cancel',
        confirmButtonText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.queryService.deleteQuery(queryId)
          .subscribe(queryList => this.queryList = queryList);
    });
  }

  isExecuted(queryId: number): boolean {
    const queryResult = this.queryList.find(query => query.id === queryId)?.result;

    if (isUndefined(queryResult?.datasets)) return false;

    return isNotNull(queryResult?.datasets);
  }

  getResultLabel(result: {datasets: number, holders: number}): string {
    if (!result?.datasets) return '';

    return `${ result.datasets } datasets from ${ result.holders } data holders`;
  }

  hasWorkflowWithRequestedTraining(queryId: number): boolean {
    const queryWorkflows = this.queryList.find(query => query.id === queryId)?.workflows as Workflow[];

    if (isUndefined(queryWorkflows) || queryWorkflows.length === 0) return false;

    return queryWorkflows.some(workflow => workflow.status !== WorkflowStatus.New);
  }
}

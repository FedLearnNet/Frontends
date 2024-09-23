import {Component, ViewChild, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {QueryDetailComponent} from '@global-app/find-data/components/query-detail/query-detail.component';
import {Query, QueryConfig, QueryResult} from '@global-app/find-data/models';
import {MatTable} from '@angular/material/table';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {ActivatedRoute} from '@angular/router';
import {SMALL, XSMALL} from '@shared-lib/constants';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {QueryBuilderService} from '@global-app/find-data/services/query-builder.service';

@Component({
  selector: 'app-find-data-dashboard',
  templateUrl: './find-data-dashboard.component.html',
  styleUrl: './find-data-dashboard.component.scss',
})
export class FindDataDashboardComponent implements OnInit {
  screenSize: string;
  isLargeScreen: boolean = true;
  isXSmallScreen: boolean = false;

  queryList: QueryResult[] = [];
  queryConfigs: QueryConfig[] = [];
  displayedColumns: string[] = ['actions', 'name', 'queryString', 'result'];

  @ViewChild(MatTable) table: MatTable<Query>;

  constructor(
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private responsiveService: ResponsiveService,
    private queryBuilderService: QueryBuilderService,
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({queryList, queryConfigs}) => {
      this.queryList = queryList.queries;
      this.queryConfigs = queryConfigs;
    });

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
    console.log('Run query', queryId);
    throw new Error('Method not implemented.');
    // this.queryService.runQuery(queryId)
    //     .subscribe(queryList => this.queryList = queryList);
  }

  onEditQuery(queryId: string): void {
    this.openQueryDetailDialog(queryId);
  }

  openQueryDetailDialog(queryId?: string): void {
    const dialogRef = this.dialog.open(QueryDetailComponent, {
      minWidth: '60%',
      data: {
        queryData: queryId ? this.queryList.find(query => query.queryId === queryId) : null,
        queryConfigs: this.queryConfigs,
      },
    });

    dialogRef.afterClosed().subscribe((queryData: Query) => {
      if (!queryData) return;

      if (queryData.id) {
        // this.queryService.editQuery(queryData)
        //     .subscribe(queryList => {
        //       this.queryList = queryList;
        //       this.table.renderRows();
        //     });

        return;
      }

      //   this.queryService.createQuery(queryData)
      //       .subscribe(queryList => {
      //         this.queryList = queryList;
      //         this.table.renderRows();
      //       });
    });
  }

  onDeleteQuery(queryId: string): void {
    console.log('Delete query', queryId);
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

      // this.queryService.deleteQuery(queryId)
      //     .subscribe(queryList => this.queryList = queryList);
    });
  }

  isExecuted(queryId: number): boolean {
    console.log('isExecuted', queryId);
    throw new Error('Method not implemented.');
    // const queryResult = this.queryList.find(query => query.id === queryId)?.result;
    //
    // if (isUndefined(queryResult?.datasets)) return false;
    //
    // return isNotNull(queryResult?.datasets);
  }

  getResultLabel(result: { datasets: number, holders: number }): string {
    if (!result?.datasets) return '';

    return `${result.datasets} datasets from ${result.holders} data holders`;
  }

  hasWorkflowWithRequestedTraining(queryId: number): boolean {
    console.log('hasWorkflowWithRequestedTraining', queryId);
    throw new Error('Method not implemented.');
    // const queryWorkflows = this.queryList.find(query => query.id === queryId)?.workflows as Workflow[];
    //
    // if (isUndefined(queryWorkflows) || queryWorkflows.length === 0) return false;
    //
    // return queryWorkflows.some(workflow => workflow.status !== WorkflowStatus.New);
  }

  getQueryString(queryString: string): string {
    return this.queryBuilderService.getFormattedQueryString(queryString, this.queryConfigs);
  }
}

import {Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {MatDialog,} from '@angular/material/dialog';
import {QueryDetailComponent} from '@global-app/find-data/components/query-detail/query-detail.component';
import {QueryConfig} from '@global-app/find-data/models';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {SMALL, XSMALL} from '@shared-lib/constants';
import {ResponsiveService} from '@shared-lib/services/responsive.service';
import {QueryBuilderService} from '@global-app/find-data/services/query-builder.service';
import {QueryDTO} from "@global-app/find-data/dto/query";
import {QueryService} from "@global-app/find-data/services/query.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonModule} from "@angular/common";
import {MatButtonModule, MatIconButton} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import {queryListResolver} from "@global-app/find-data/services/query-resolver.service";

@Component({
  selector: 'app-find-data-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatIconButton,
    MatInputModule,
    MatTableModule,
    MatMenuModule,
    RouterLink,
  ],
  templateUrl: './find-data-dashboard.component.html',
  styleUrl: './find-data-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindDataDashboardComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly queryBuilderService: QueryBuilderService = inject(QueryBuilderService);
  private readonly queryService: QueryService = inject(QueryService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);

  screenSize: string;
  isLargeScreen: boolean = true;
  isXSmallScreen: boolean = false;

  dataSource: MatTableDataSource<QueryDTO> = new MatTableDataSource();
  queryList: QueryDTO[] = [];
  queryConfigs: QueryConfig[] = [];
  displayedColumns: string[] = ['name', 'description', 'queryString', 'result', 'actions'];


  ngOnInit(): void {

    this.queryService.getAllQueries().subscribe((queries) => {
      this.queryList = queries;
      this.dataSource.data = this.queryList;
      this.cdr.detectChanges();
    });
    this.queryBuilderService.getQueryConfigs().subscribe((queryConfigs) => {
      this.queryConfigs = queryConfigs;
      this.cdr.detectChanges();
    });

    this.queryService.getAllQueriesSSE().subscribe((query: QueryDTO) => {
      const existingQueryIndex = this.queryList.findIndex(q => q.id === query.id);
      if (existingQueryIndex !== -1) {
        this.queryList[existingQueryIndex] = query;
      } else {
        this.queryList.push(query);
      }
      this.dataSource.data = this.queryList;
      this.cdr.detectChanges();
    });

    this.checkAndAdjustResponsiveLayout();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .isScreenSizeGreaterThan(SMALL)
      .subscribe(isLargeScreen => {
        this.isLargeScreen = isLargeScreen;
        this.cdr.detectChanges();
      });

    this.responsiveService
      .getScreenSize()
      .subscribe(screenSize => {
        this.screenSize = screenSize;
        this.isXSmallScreen = screenSize === XSMALL;
        this.cdr.detectChanges();
      });
  }

  onCreateQuery(): void {
    this.openQueryDetailDialog();
  }

  onRunQuery(queryId: number): void {
    this.queryService.fireQuery(queryId).subscribe((firedQuery) => {
      this.queryList = this.queryList.map(query => query.id === queryId ? firedQuery : query);
      this.snackBar.open("Query fired", 'Close', {duration: 5000});
      this.dataSource.data = this.queryList;
      this.cdr.detectChanges();
    });
  }

  onEditQuery(queryId: number): void {
    this.openQueryDetailDialog(queryId);
  }

  openQueryDetailDialog(queryId?: number): void {
    const dialogRef = this.dialog.open(QueryDetailComponent, {
      minWidth: '60%',
      data: {
        queryData: queryId ? this.queryList.find(query => query.id === queryId) : null,
        queryConfigs: this.queryConfigs,
      },
    });

    dialogRef.afterClosed().subscribe((queryData: QueryDTO) => {
      if (!queryData) return;
      if (!queryId) {
        this.queryList.push(queryData);
      }else{
        this.queryList = this.queryList.map(query => query.id === queryData.id ? queryData : query);
      }
      this.dataSource.data = this.queryList;
      this.cdr.detectChanges();
    });
  }

  onDeleteQuery(queryId: number): void {
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

      this.queryService.deleteQuery(queryId)
        .subscribe(() => {
          this.queryList = this.queryList.filter(query => query.id !== queryId);
          this.dataSource.data = this.queryList;
          this.cdr.detectChanges();
        });
    });
  }

  getQueryString(query: QueryDTO): string {
    return this.queryBuilderService.getFormattedQueryString(query, this.queryConfigs);
  }
}

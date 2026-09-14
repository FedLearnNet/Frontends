import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {MatDialog,} from '@angular/material/dialog';
import {QueryDetailComponent} from '@global-app/find-data/components/query-detail/query-detail.component';
import {QueryConfig} from '@global-app/find-data/models';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {Router, RouterLink} from '@angular/router';
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
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";

@Component({
  selector: 'app-find-data-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatIconButton,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    RouterLink,
    TranslatePipe,
    HeaderComponent,
    EmptyStateComponent,
    PageWrapperComponent,
    TimeBadgeComponent,

  ],
  templateUrl: './find-data-dashboard.component.html',
  styleUrl: './find-data-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FindDataDashboardComponent implements OnInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);
  private readonly queryBuilderService: QueryBuilderService = inject(QueryBuilderService);
  private readonly queryService: QueryService = inject(QueryService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly router: Router = inject(Router);

  @ViewChild(MatSort)
  set sort(sort: MatSort | undefined) {
    if (!sort) return;
    this.dataSource.sort = sort;
  }

  screenSize: string;
  isLargeScreen: boolean = true;
  isXSmallScreen: boolean = false;

  dataSource: MatTableDataSource<QueryDTO> = new MatTableDataSource();
  queryList: QueryDTO[] = [];
  queryConfigs: QueryConfig[] = [];
  displayedColumns: string[] = ['name', 'description', 'queryString', 'update', 'result', 'actions'];

  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.queryService.getAllQueries().subscribe((queries) => {
      this.queryList = queries;
      this.dataSource.data = this.queryList;
      this.isLoading.set(false);
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

  get isEmpty(): boolean {
    return this.queryList.length === 0;
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

  onSearchInput(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  onSearchKeyInput(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.dataSource.filter = '';
    }
  }

  onRunQuery(queryId: number): void {
    this.queryService.fireQuery(queryId).subscribe((firedQuery) => {
      this.queryList = this.queryList.map(query => query.id === queryId ? firedQuery : query);
      this.snackBar.open(
        this.translate.instant('QUERY_FIRED'),
        this.translate.instant('BUTTON.CLOSE'),
        {
          duration: 5000,
        });
      this.dataSource.data = this.queryList;
      this.cdr.detectChanges();
    });
  }

  onEditQuery(queryId: number): void {
    this.router.navigate(['/find-data', queryId]);
  }

  openQueryDetailDialog(queryId?: number): void {
    const dialogRef = this.dialog.open(QueryDetailComponent, {
      minWidth: '60%',
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        queryData: queryId ? this.queryList.find(query => query.id === queryId) : null,
        queryConfigs: this.queryConfigs,
      },
    });

    dialogRef.afterClosed().subscribe((queryData: QueryDTO) => {
      if (!queryData) return;
      const existingIndex = this.queryList.findIndex(q => q.id === queryData.id);
      if (existingIndex !== -1) {
        this.queryList[existingIndex] = queryData;
      } else {
        this.queryList.push(queryData);
      }
      this.dataSource.data = this.queryList;
      this.cdr.detectChanges();
    });
  }

  onDeleteQuery(queryId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.DELETEQUERY.TITLE'),
        message: this.translate.instant('DIALOG.DELETEQUERY.MESSAGE'),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.DELETE'),
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

  constructor() {
    this.dataSource.filterPredicate = (query, filter) => {
      const search = (filter ?? '').trim().toLowerCase();
      if (!search) {
        return true;
      }

      return [
        query.name,
        query.description,
        query.result,
        this.getQueryString(query),
      ]
        .map(value => `${value ?? ''}`.toLowerCase())
        .some(value => value.includes(search));
    };

    this.dataSource.sortingDataAccessor = (query, sortHeaderId) => {
      switch (sortHeaderId) {
        case 'name':
          return query.name?.toLowerCase() ?? '';
        case 'updatedAt':
          return query.updatedAt ? new Date(query.updatedAt).getTime() : 0;
        case 'result':
          return query.result ?? 0;
        default:
          return '';
      }
    };
  }
}

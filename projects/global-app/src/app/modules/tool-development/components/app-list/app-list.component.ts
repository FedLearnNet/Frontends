import {AfterViewInit, Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";

import {TranslatePipe} from "@ngx-translate/core";
import {NewAppDialogComponent} from "../new-app-dialog/new-app-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {PublishBadgeComponent} from "@shared-lib/components/publish-badge/publish-badge.component";
import {AppTypeBadgeComponent} from "@shared-lib/modules/store/components/app-type-badge/app-type-badge.component";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

@Component({
  selector: 'app-app-list',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    RouterLink,
    TranslatePipe,
    PublishBadgeComponent,
    AppTypeBadgeComponent,
    HeaderComponent,
    EmptyStateComponent,
    PageWrapperComponent,
  ],
  templateUrl: './app-list.component.html',
  styleUrl: './app-list.component.scss'
})
export class AppListComponent implements OnInit, AfterViewInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly dialog: MatDialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['id', 'name', 'type', 'publishStatus', 'shortDescription'];
  dataSource: MatTableDataSource<AppDetailDto> = new MatTableDataSource();

  latestSearchValue = signal<string>('')
  loading = signal<boolean>(true);
  isEmpty = signal<boolean>(true);

  ngOnInit() {
    this.activatedRoute.data.subscribe(({apps}) => {
      this.loading.set(false);
      this.dataSource.data = apps;
      if (apps && apps.length > 0) {
        this.isEmpty.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.latestSearchValue.set(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  createNewApp(): void {
    this.dialog.open(NewAppDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false
    });
  }

}

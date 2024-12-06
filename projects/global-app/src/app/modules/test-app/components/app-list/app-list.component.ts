import {AfterViewInit, Component, inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatTabGroup} from "@angular/material/tabs";
import {SharedLibModule} from "@shared-lib/shared-lib.module";

@Component({
  selector: 'app-app-list',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabGroup,
    SharedLibModule,
    RouterLink
  ],
  templateUrl: './app-list.component.html',
  styleUrl: './app-list.component.scss'
})
export class AppListComponent implements OnInit, AfterViewInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['id', 'slug', 'name', 'publishStatus', 'shortDescription'];
  dataSource: MatTableDataSource<AppDetailDto> = new MatTableDataSource();

  ngOnInit() {
    this.activatedRoute.data.subscribe(({apps}) => {
      this.dataSource.data = apps;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

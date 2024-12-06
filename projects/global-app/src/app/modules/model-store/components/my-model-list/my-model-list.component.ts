import {AfterViewInit, Component, inject, Input, OnInit, ViewChild} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource, MatTableModule
} from "@angular/material/table";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {MatTabGroup} from "@angular/material/tabs";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {ModelDto} from "@global-app/model-store/dto/model";
import {ModelService} from "@global-app/model-store/services/model.service";

@Component({
  selector: 'app-my-model-list',
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
  templateUrl: './my-model-list.component.html',
  styleUrl: './my-model-list.component.scss'
})
export class MyModelListComponent implements OnInit, AfterViewInit {
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly modelService: ModelService = inject(ModelService);

  @Input() forAppId?: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['id', 'name', 'publishStatus', 'shortDescription', 'appId', 'appName'];
  dataSource: MatTableDataSource<ModelDto> = new MatTableDataSource();

  ngOnInit() {
    if(this.forAppId) {
      this.displayedColumns = ['id', 'name', 'publishStatus', 'shortDescription'];

      this.modelService.getMyModels(this.forAppId).subscribe((models) => {
        this.dataSource.data = models;
      });
    }else{
      this.activatedRoute.data.subscribe(({models}) => {
        this.dataSource.data = models;
      });
    }
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

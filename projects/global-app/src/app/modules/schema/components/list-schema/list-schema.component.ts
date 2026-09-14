import {Component, inject, OnInit, signal} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {SchemaService} from "@global-app/schema/services/schema.service";
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {SchemaNodeDetailDTO} from "@global-app/schema/dto/schema";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";

@Component({
  selector: 'app-list-schema',
  templateUrl: './list-schema.component.html',
  styleUrl: './list-schema.component.scss',
  imports: [MatButton, RouterLink, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, TranslatePipe, HeaderComponent, PageWrapperComponent]
})
export class ListSchemaComponent implements OnInit {
  readonly schemaService: SchemaService = inject(SchemaService);

  displayedColumns: string[] = ['id', 'name', 'description'];
  dataSource = new MatTableDataSource<SchemaNodeDetailDTO>();

  loading = signal<boolean>(true);
  filterValue = signal<string>('');

  ngOnInit() {
    this.schemaService.getAllSchemasHead().subscribe(schemas => {
      this.loading.set(false)
      this.dataSource = new MatTableDataSource(schemas);
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue.set(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}

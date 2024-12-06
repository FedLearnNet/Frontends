import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {RunMessageLogDTO} from "../../../../dto/log";
import {DatePipe} from "@angular/common";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";

@Component({
  selector: 'app-app-log-table',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,
    DatePipe,
    MatPaginatorModule],
  templateUrl: './app-log-table.component.html',
  styleUrl: './app-log-table.component.scss'
})
export class AppLogTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() logs: RunMessageLogDTO[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['severity', 'timestamp', 'summary'];
  dataSource: MatTableDataSource<RunMessageLogDTO> = new MatTableDataSource();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["logs"]) {
      this.dataSource.data = changes["logs"].currentValue;
    }
  }

  ngOnInit(): void {
    this.dataSource.data = this.logs;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


}

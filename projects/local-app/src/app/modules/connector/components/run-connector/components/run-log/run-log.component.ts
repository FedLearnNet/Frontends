import {AfterViewInit, Component, Input, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {RunErrorLogDTO} from "../../../../dto/log";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatSelectChange} from "@angular/material/select";
import {mapNumericTypeToRunLogsType, RunLogsType} from "../../../../enum/run-logs";
import {ConnectorRunService} from "../../../../services/run.service";
import {catchError, of} from "rxjs";

@Component({
  selector: 'app-run-error-log',
  templateUrl: './run-log.component.html',
  styleUrl: './run-log.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RunConnectorLogComponent implements OnInit, AfterViewInit {
  levelVariants: string[] = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"];
  typesVariants: string[] = ["LOADING", "TRANSFORMING", "MAPPING", "PERSISTENT", "HARMONIZER"];
  fieldsVariants: string[] = [];

  loadingErrorLogs: boolean = false;

  @Input() showPatientId: boolean = false;
  @Input() type: RunLogsType | number = RunLogsType.ERROR;
  @Input() runId?: number = undefined;
  data: RunErrorLogDTO[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['patientId', 'field', 'message', 'level', 'logType'];
  dataSource = new MatTableDataSource(this.data);

  constructor(
    private connectorRunService: ConnectorRunService
  ) {
  }

  ngOnInit(): void {
    if (!this.runId) {
      this.loadingErrorLogs = true;
      return;
    }
    this.type = mapNumericTypeToRunLogsType(this.type);

    if (this.showPatientId) {
      this.displayedColumns = ['patientId', 'field', 'message', 'level'];

      this.fieldsVariants = this.data.map((log) => log.field!)
        .filter((value, index, self) => self.indexOf(value) === index);
    } else {
      this.displayedColumns = ['message', 'level', 'logType'];
    }
    if (this.type == 0) { //RunLogsType.ERROR
      this.connectorRunService.getErrorLogs(this.runId).pipe(
        catchError(() => {
          this.loadingErrorLogs = true;
          return of([]);
        })
      ).subscribe((logs) => {
        this.data = logs as RunErrorLogDTO[];
        this.dataSource = new MatTableDataSource(this.data);
      });
    } else {
      this.connectorRunService.getRunErrorLogs(this.runId, this.type).pipe(
        catchError(() => {
          this.loadingErrorLogs = true;
          return of([]);
        })
      ).subscribe((logs) => {
        this.data = logs as RunErrorLogDTO[];
        this.dataSource = new MatTableDataSource(this.data);
      });
    }
    this.dataSource = new MatTableDataSource(this.data);

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applySelectionFilter(event: MatSelectChange, row: string) {
    const selectedValues = event.value;
    const filterString = Array.isArray(selectedValues) && selectedValues.length > 0 ? selectedValues.join('|') : '';

    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const filters = filter.split('|');
      return filters.some(f => data[row] && data[row].includes(f));
    };

    this.dataSource.filter = filterString;
  }

}

import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ConnectorRunService} from "../../../../services/run.service";
import {RunChangesLogDTO} from "../../../../dto/log";
import {MatSelectChange} from "@angular/material/select";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-run-change-log',
  templateUrl: './run-change-log.component.html',
  styleUrl: './run-change-log.component.scss'
})
export class RunConnectorChangeLogComponent implements OnInit, AfterViewInit {
  loadingErrorLogs: boolean = false;
  data: RunChangesLogDTO[] = [];
  count: number = 0;
  displayedColumns: string[] = ['patientId', 'status'];
  displayedDetailColumns: string[] = ['field', 'oldValue', 'newValue'];
  statusVariants: string[] = ['Unchanged', 'Changed', 'Created', 'Deleted'];
  dataSource = new MatTableDataSource(this.data);

  currentData?: RunChangesLogDTO;

  @Input() runId?: number = undefined;
  @Input() schemaId?: string = undefined;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private connectorRunService: ConnectorRunService
  ) {
  }

  ngOnInit() {
    this.loadData(0, 5, '');
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe((event) => {
      this.loadData(event.pageIndex, event.pageSize, '');
    });
  }

  loadData(page: number, page_size: number, search: string) {
    if (!this.runId || !this.schemaId) {
      this.loadingErrorLogs = true;
      return;
    }

    this.connectorRunService.getRunChangesLogs(this.schemaId, this.runId, page, page_size, search).subscribe((data) => {
      this.data = data.results;
      this.count = data.count;
      if (this.data.length > 0) {
        this.currentData = this.data[0];
      }
      this.dataSource = new MatTableDataSource(this.data);
    });
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

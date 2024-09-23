import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {DataSource} from "@angular/cdk/collections";
import {Observable, ReplaySubject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {getArrayOrString, isArray, ListViewComponentDialogComponent} from "../list-view/list-view.component";

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class ConnectorDynamicTableComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() renamedColumns?: string[];
  @Input() deletedColumns?: boolean[];
  @Input() hideDeleted: boolean = false;
  @Input() headerAction: boolean = true;
  @Input() renewColumns: boolean = false;
  @Input() calledColumns: string[] = [];
  @Output() headerClicked = new EventEmitter<{ columnName: string, index: number }>();

  dataSource = new DynamicDataSource(this.data);

  constructor(private cdr: ChangeDetectorRef,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (this.renamedColumns === undefined) {
      this.renamedColumns = this.columns;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["data"] || changes["columns"] || changes["renamedColumns"]) {
      if (this.renewColumns && this.data.length > 0 && this.data[0]) {
        this.columns = Object.keys(this.data[0]);
        this.renamedColumns = this.columns;
        this.deletedColumns = new Array(this.columns.length).fill(false);
        this.hideDeleted = false;
      }
      this.dataSource.setData(this.data);
      this.cdr.detectChanges();
    }
  }

  getColumns(): string[] {
    if (this.hideDeleted) {
      return this.columns.filter((_, index) => !this.isDeleted(index));
    }
    return this.columns;
  }

  hasCalledColumns(column: string): boolean {
    return this.calledColumns.includes(column);
  }

  headerClick(columnName: string, index: number): void {
    this.headerClicked.emit({columnName, index});
    console.log(`Header clicked: ${columnName} at index ${index}`);
  }

  getDisplayedName(index: number): string {
    if (this.renamedColumns) {
      return this.renamedColumns[index];
    }
    return this.columns[index];
  }

  isDeleted(index: number): boolean {
    if (this.deletedColumns !== undefined) {
      return this.deletedColumns![index];
    }
    return false;
  }

  getValue(column: string, row: any): string {
    if (!row || !(column in row)) {
      return "";
    }

    const data = row[column];
    return getArrayOrString(data, 0);

  }

  isList(column: string, row: any): boolean {
    if (!row || !(column in row)) {
      return false;
    }

    const data = row[column];
    return isArray(data);
  }

  openArrayDialog(column: string, row: any): void {
    const data = row[column];
    this.dialog.open(ListViewComponentDialogComponent, {
      data: {list: getArrayOrString(data), name: column},
      minWidth: '200px',
    });
  }
}


class DynamicDataSource extends DataSource<any> {
  private _dataStream = new ReplaySubject<any[]>();

  constructor(initialData: any[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<any[]> {
    return this._dataStream;
  }

  disconnect() {
  }

  setData(data: any[]) {
    this._dataStream.next(data);
  }
}

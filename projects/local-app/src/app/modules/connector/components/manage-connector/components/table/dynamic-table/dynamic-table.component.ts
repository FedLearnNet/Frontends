import {Component, effect, inject, input, model, output, untracked} from '@angular/core';
import {DataSource} from "@angular/cdk/collections";
import {Observable, ReplaySubject} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {getArrayOrString, isArray, ListViewComponentDialogComponent} from "../list-view/list-view.component";
import {MatTableModule} from '@angular/material/table';

import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from "@angular/material/button";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss',
  imports: [
    MatTableModule,
    MatIcon,
    MatIconButton,
    SkeletonLoaderComponent
  ]
})
export class ConnectorDynamicTableComponent {
  dialog = inject(MatDialog);

  readonly data = input<any[]>([]);
  readonly calledColumns = input<string[]>([]);
  readonly headerAction = input<boolean>(true);
  readonly renewColumns = input<boolean>(false);
  readonly loading = input<boolean | undefined>(false);

  readonly columns = model<string[]>([]);
  readonly renamedColumns = model<string[] | undefined>(undefined);
  readonly deletedColumns = model<boolean[] | undefined>(undefined);
  readonly hideDeleted = model<boolean>(false);

  readonly headerClicked = output<{
    columnName: string;
    index: number;
  }>();

  dataSource = new DynamicDataSource([]);

  private arraysEqual(a: string[] | undefined, b: string[] | undefined): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  constructor() {
    effect(() => {
      const data = this.data();
      const renew = this.renewColumns();

      if (this.renamedColumns() === undefined) {
        const cols = this.columns();
        if (cols.length > 0) {
          untracked(() => this.renamedColumns.set(cols));
        }
      }
      const firstRow = data[0];
      if (renew && data.length > 0 && this.hasOwnKeys(firstRow)) {
        const newCols = Object.keys(firstRow);
        const currentCols = this.columns();

        if (!this.arraysEqual(currentCols, newCols)) {
          untracked(() => {
            this.columns.set(newCols);
            this.renamedColumns.set(newCols);
            this.deletedColumns.set(new Array(newCols.length).fill(false));
            this.hideDeleted.set(false);
          });
        }
      }
      if (data.length > 0 && this.hasOwnKeys(firstRow)) {
        this.dataSource.setData(data);
      }
    });
  }

  getColumns(): string[] {
    const cols = this.columns();
    if (this.hideDeleted()) {
      return cols.filter((_, index) => !this.isDeleted(index));
    }
    return cols;
  }

  hasCalledColumns(column: string): boolean {
    return this.calledColumns().includes(column);
  }

  headerClick(columnName: string, index: number): void {
    this.headerClicked.emit({columnName, index});
  }

  getDisplayedName(index: number): string {
    const renamed = this.renamedColumns();
    const cols = this.columns();
    return renamed?.[index] ?? cols[index] ?? '';
  }

  isDeleted(index: number): boolean {
    const deleted = this.deletedColumns();
    return deleted?.[index] ?? false;
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

  private hasOwnKeys(value: unknown): value is Record<string, unknown> {
    if (value == null) return false;
    if (typeof value !== 'object') return false;
    return Object.keys(value as object).length > 0;
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

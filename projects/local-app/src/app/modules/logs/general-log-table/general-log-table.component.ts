import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {DatePipe} from "@angular/common";
import {merge} from 'rxjs';
import {LogPage} from "../dto/page";
import {LoadLogData} from "../model/log-wrapper";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatChipSelectionChange, MatChipsModule} from "@angular/material/chips";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-general-log-table',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    DatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule],
  templateUrl: './general-log-table.component.html',
  styleUrl: './general-log-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralLogTableComponent implements OnInit, OnChanges, AfterViewInit {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Output() loadData: EventEmitter<LoadLogData> = new EventEmitter<LoadLogData>();
  @Output() openDetail: EventEmitter<string> = new EventEmitter<string>();

  @Input() loadedData: LogPage<any>;
  @Input() displayedColumns: string[] = ["id", "createdAt"];
  @Input() filters: string[] = [];
  @Input() allowSearch: boolean = true;

  resultsLength = 0;

  dataSource: MatTableDataSource<LogPage<any>>;

  data: any[] = [];

  selectedFilter: boolean[] = [];
  searchValue: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    this.loadData.emit({
      sort: 'id',
      order: 'asc',
      page: 1
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["loadedData"]) {
      const data: LogPage<any> = changes["loadedData"].currentValue;
      this.data = data.results;
      this.resultsLength = data.count;
      this.cdr.detectChanges();
    }
    if (changes["filters"]) {
      this.clearFilters();
    }
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 1));


    merge(this.sort.sortChange, this.paginator.page).subscribe(
      () => {
        this.applyHttp();
      }
    );
  }

  openDetailEvent(id: string) {
    this.openDetail.emit(id);
  }

  getAdditionalColumns(): string[] {
    return this.displayedColumns.filter(column => !["id", "createdAt"].includes(column));
  }

  columnsHasId(): boolean {
    return this.displayedColumns.includes("id");
  }

  columnsHasCreatedAt(): boolean {
    return this.displayedColumns.includes("createdAt");
  }

  applyHttp(){
    this.loadData.emit({
      sort: this.sort.active,
      order: this.sort.direction,
      page: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      search: this.searchValue !== '' ? this.searchValue : undefined,
      filters: this.filters.filter((_, index) => this.selectedFilter[index])
    });
    this.cdr.detectChanges();
  }
  applySearch(event: Event) {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.paginator.pageIndex = 1;
    this.applyHttp();
  }

  clearFilters() {
    this.selectedFilter = this.filters.map(() => false);
    this.applyHttp();
  }

  applyFilter(ev: MatChipSelectionChange, index: number) {
    this.selectedFilter[index] = ev.selected;
    this.applyHttp();
  }
}

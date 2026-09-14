import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild
} from '@angular/core';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {merge} from 'rxjs';
import {LogPage} from "../../dto/page";
import {LoadLogData} from "../../model/log-wrapper";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatChipSelectionChange, MatChipsModule} from "@angular/material/chips";
import {MatButtonModule} from "@angular/material/button";
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from "@ngx-translate/core";
import {PaginatorStateService} from '@shared-lib/services/paginator-state.service';
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";

@Component({
  selector: 'app-general-log-table',
  imports: [
    MatProgressSpinnerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatButtonModule,
    TranslatePipe,
    MatIcon,
    TranslatePipe,
    TimeBadgeComponent,

  ],
  templateUrl: './general-log-table.component.html',
  styleUrl: './general-log-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralLogTableComponent implements OnInit, AfterViewInit {
  tableKey = input<string>();
  allowSearch = input<boolean>(true);
  loadedData = input.required<LogPage<any>>();
  displayedColumns = input<string[]>(["actions", "createdAt"]);
  filters = input<string[]>([]);

  loadData = output<LoadLogData>();
  openDetail = output<number | string>();

  currentPage = signal<number>(0);
  pageSize = signal<number>(25)
  resultsLength = signal<number>(0)
  data = signal<any[]>([]);
  selectedFilter = signal<boolean[]>([]);
  searchValue = signal<string>('');

  additionalColumns = computed(() =>
    this.displayedColumns().filter(
      col => !['actions', 'id', 'createdAt'].includes(col)
    )
  );
  hasIdColumn = computed(() =>
    this.displayedColumns().includes('id')
  );
  hasCreatedAtColumn = computed(() =>
    this.displayedColumns().includes('createdAt')
  );

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private readonly paginatorStateService = inject(PaginatorStateService);

  constructor() {
    effect(() => {
      const page = this.loadedData();
      if (page) {
        this.data.set(page.results);
        this.currentPage.set(page.page);
        this.pageSize.set(page.pageSize);
        this.resultsLength.set(page.totalCount);
      }
    });
    effect(() => {
      const f = this.filters();
      if (f != null) {
        this.clearFilters();
      }
    });
  }

  ngOnInit() {
    this.loadPaginatorState();

    this.loadData.emit({
      sort: 'createdAt',
      order: 'asc',
      page: this.currentPage(),
      pageSize: this.pageSize(),
    });
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page).subscribe(
      () => {
        this.applyHttp();
      }
    );
  }

  openDetailEvent(id: number | string) {
    this.openDetail.emit(id);
  }

  applyHttp() {
    if (!this.sort || !this.paginator) {
      return;
    }
    this.loadData.emit({
      sort: this.sort.active,
      order: this.sort.direction,
      page: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      search: this.searchValue() !== '' ? this.searchValue() : undefined,
      filters: this.filters().filter((_, index) => this.selectedFilter()[index])
    });
  }

  applySearch(event: Event) {
    this.searchValue.set((event.target as HTMLInputElement).value);
    this.paginator.pageIndex = 0;
    this.applyHttp();
  }

  clearFilters() {
    this.selectedFilter.set(this.filters().map(() => false));
    this.applyHttp();
  }

  applyFilter(ev: MatChipSelectionChange, index: number) {
    this.selectedFilter.update(current => {
      return current.map((_, i) => i === index ? ev.selected : false);
    });

    this.applyHttp();
  }

  protected onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);

    if (!this.tableKey()) {
      return;
    }

    this.paginatorStateService.set(this.tableKey()!, {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });

    this.loadData.emit({
      sort: 'createdAt',
      order: 'asc',
      page: this.currentPage(),
      pageSize: this.pageSize(),
    });
  }

  private loadPaginatorState(): void {
    if (!this.tableKey()) {
      return;
    }

    const savedPaginatorState = this.paginatorStateService.get(this.tableKey() as string);
    if (!savedPaginatorState) {
      return;
    }

    this.pageSize.set(savedPaginatorState.pageSize);
    this.currentPage.set(savedPaginatorState.pageIndex);
  }
}

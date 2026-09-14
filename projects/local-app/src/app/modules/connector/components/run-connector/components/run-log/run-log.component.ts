import {
  AfterViewInit,
  Component,
  computed,
  inject,
  Input,
  input,
  OnInit,
  signal,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
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
import {ConnectorRunLogRowDTO, ConnectorRunPatientLogDTO} from "../../../../dto/log";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatSort, MatSortHeader} from "@angular/material/sort";
import {MatOption, MatSelect, MatSelectChange} from "@angular/material/select";
import {mapNumericTypeToRunLogsType, RunLogsType} from "../../../../enum/run-logs";
import {ConnectorRunService} from "../../../../services/run.service";
import {catchError, finalize, Observable, of, tap} from "rxjs";
import {LEVEL_VARIANTS, TYPE_VARIANTS} from '../../../../constansts/log.constants';
import {SchemaNodeNestedDto, SchemaRootNodeDto} from '@local-app/cohort/dto/schema';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TitleCasePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {PaginatorStateService} from '@shared-lib/services/paginator-state.service';
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";

@Component({
  selector: 'app-run-error-log',
  templateUrl: './run-log.component.html',
  styleUrl: './run-log.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [MatPaginator, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, TitleCasePipe, TranslatePipe, TimeBadgeComponent]
})
export class RunConnectorLogComponent implements OnInit, AfterViewInit {
  readonly levelVariants = [...LEVEL_VARIANTS];
  readonly typesVariants = [...TYPE_VARIANTS];
  readonly pageSizeOptions = [5, 10, 25, 100];

  filter = signal<string>('');
  selectedFilter = signal<string[]>([]);
  selectedFilterKey = signal<string>('');
  pageSize = signal<number>(this.pageSizeOptions[1]);

  loadingErrorLogs: boolean = false;

  @Input() type: RunLogsType | number = RunLogsType.ERROR;

  readonly runId = input<number>();
  readonly showPatientId = input<boolean>(false);
  readonly schemaRoot = input<SchemaRootNodeDto>();

  data = signal<(ConnectorRunPatientLogDTO | ConnectorRunLogRowDTO)[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['message', 'date'];
  dataSource = new MatTableDataSource(this.data());

  private readonly connectorRunService = inject(ConnectorRunService);
  private readonly paginatorStateService = inject(PaginatorStateService);

  readonly selectConfigs: { [key: number]: { label: string; variants: string[] | (() => string[]); key: string } } = {
    [RunLogsType.ERROR]: {
      label: 'GRID.SEVERITY',
      variants: this.levelVariants,
      key: 'severity',
    },
    [RunLogsType.RUN_ERROR]: {
      label: 'GRID.LOG_TYPE',
      variants: this.typesVariants,
      key: 'logType',
    },
    [RunLogsType.HARMONIZER]: {
      label: 'GRID.FIELDS',
      variants: () => this.fieldsVariants(),
      key: 'field',
    },
  };

  fieldsVariants = computed(() => {
    if (!this.showPatientId()) return [];

    return Array.from(
      new Set(
        this.data()
          .filter((log): log is ConnectorRunPatientLogDTO => 'field' in log)
          .map(log => log.field!)
      )
    );
  });

  get currentConfig() {
    const config = this.selectConfigs[this.type];
    if (!config) return undefined;

    const variants =
      typeof config.variants === 'function' ? config.variants() : config.variants;

    return {...config, variants};
  }

  get paginatorKey(): string {
    return 'run-connector-log-' + this.type + '-' + this.runId();
  }

  ngOnInit(): void {
    if (!this.runId()) {
      this.loadingErrorLogs = true;
      return;
    }

    this.type = mapNumericTypeToRunLogsType(this.type);
    this.displayedColumns = [...this.getBaseColumns(), ...this.displayedColumns];

    if (this.type === RunLogsType.ERROR) {
      this.selectedFilter.set(['INFO']);
      this.selectedFilterKey.set('severity');
    }

    this.loadPaginatorState();
    this.loadLogs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter.set(filterValue.trim().toLowerCase());
    this.applyClientFilters();
  }

  applySelectionFilter(event: MatSelectChange, row: string) {
    const selectedValues = event.value;
    this.selectedFilter.set(
      Array.isArray(selectedValues) ? selectedValues : []
    );
    this.selectedFilterKey.set(row);
    this.applyClientFilters();
  }

  private getBaseColumns(): string[] {
    if (this.showPatientId()) {
      return ['patientId', 'field'];
    }

    switch (this.type) {
      case RunLogsType.RUN_ERROR:
        return ['logType'];
      case RunLogsType.ERROR:
        return ['level'];
      default:
        return ['level', 'logType'];
    }
  }

  private findNodeById(nodes: SchemaNodeNestedDto[], id: number): SchemaNodeNestedDto | undefined {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.childNodes?.length) {
        const found = this.findNodeById(node.childNodes, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  private mapFieldIdsToNames(rows: ConnectorRunPatientLogDTO[], schemaRoot: SchemaRootNodeDto) {
    return rows.map(row => {
      const node = this.findNodeById(schemaRoot.childNodes ?? [], Number(row.field));
      return {
        ...row,
        field: node ? node.name : row.field
      };
    });
  }

  protected onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);

    this.paginatorStateService.set(this.paginatorKey, {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }

  private loadLogs(): void {
    this.loadingErrorLogs = true;

    const logs$: Observable<(ConnectorRunPatientLogDTO | ConnectorRunLogRowDTO)[]> =
      this.type === RunLogsType.ERROR
        ? this.connectorRunService.getErrorLogs(this.runId()!)
        : this.connectorRunService.getRunErrorLogs(
          this.runId()!, this.type
        );

    logs$
      .pipe(
        tap((logs) => {
          const schemaRoot = this.schemaRoot();
          if (this.type === RunLogsType.HARMONIZER && schemaRoot) {
            this.data.set(this.mapFieldIdsToNames(
              logs as ConnectorRunPatientLogDTO[], schemaRoot
            ));
          } else {
            this.data.set(logs);
          }
        }),
        finalize(() => {
          this.loadingErrorLogs = false;
          this.dataSource.data = this.data();
          this.applyClientFilters();
        }),
        catchError(() => {
          this.data.set([]);
          return of([]);
        })
      )
      .subscribe();
  }

  private applyClientFilters(): void {
    const selected = this.selectedFilter();
    const key = this.selectedFilterKey();
    const textFilter = this.filter();

    this.dataSource.filterPredicate = (data: any): boolean => {
      if (selected.length > 0 && key) {
        const match = selected.some(
          f => data[key] && data[key].includes(f)
        );
        if (!match) return false;
      }
      if (textFilter) {
        const dataStr = Object.values(data)
          .join(' ').toLowerCase();
        if (!dataStr.includes(textFilter)) return false;
      }
      return true;
    };
    // Trigger filtering — value just needs to change or be re-set
    this.dataSource.filter = `${selected.join('|')}::${textFilter}`;
  }

  private loadPaginatorState(): void {
    const savedPaginatorState = this.paginatorStateService.get(this.paginatorKey);

    if (!savedPaginatorState) {
      return;
    }

    this.pageSize.set(savedPaginatorState.pageSize);
  }
}

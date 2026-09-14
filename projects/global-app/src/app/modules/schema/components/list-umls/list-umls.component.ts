import {Component, effect, inject, signal, viewChild} from '@angular/core';
import {UMLSService} from "@global-app/schema/services/umls";
import {UMLSDetailResultDTO, UMLSSearchResultDTO, UMLSSearchResultDtoPage} from "../../dto/umls";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {MatDialog} from "@angular/material/dialog";
import {UmlsParentGraphComponent} from "../umls-parent-graph/umls-parent-graph.component";
import {MatTableModule} from '@angular/material/table';
import {MatIconButton, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {finalize} from "rxjs";

@Component({
  selector: 'app-list-umls',
  templateUrl: './list-umls.component.html',
  styleUrl: './list-umls.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [
    MatTableModule,
    MatIconButton,
    MatIcon,
    MatCardModule,
    MatButton,
    MatPaginatorModule,
    TranslatePipe,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
  ]
})
export class ListUMLSComponent {
  readonly uMLSService: UMLSService = inject(UMLSService)
  readonly dialog = inject(MatDialog);
  readonly paginator = viewChild(MatPaginator);

  displayedColumns: string[] = ['ui', 'name', 'rootSource', 'expand'];
  readonly pageSize = 30;
  readonly search = signal<string>('');
  readonly debouncedSearch = signal<string>('');
  readonly data = signal<UMLSSearchResultDTO[]>([]);
  readonly expandedElement = signal<UMLSSearchResultDTO | null>(null);
  readonly expandedDetail = signal<UMLSDetailResultDTO | null>(null);
  readonly resultsLength = signal<number>(0);
  readonly pageIndex = signal<number>(0);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly detailLoadingUi = signal<string | null>(null);
  readonly detailError = signal<string | null>(null);

  private readonly DEBOUNCE_TIME_MS = 400;

  private readonly searchDebounceEffect = effect((onCleanup) => {
    const term = this.search();
    const debounceTimer = setTimeout(() => {
      this.debouncedSearch.set(term.trim());
    }, this.DEBOUNCE_TIME_MS);

    onCleanup(() => clearTimeout(debounceTimer));
  });

  private readonly loadEffect = effect((onCleanup) => {
    const search = this.debouncedSearch();
    const pageIndex = this.pageIndex();

    this.loading.set(true);
    this.error.set(null);

    const subscription = this.uMLSService.search(search, pageIndex + 1, this.pageSize)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data: UMLSSearchResultDtoPage) => {
          this.data.set(data.results);
          this.resultsLength.set(data.total);
        },
        error: (err) => {
          this.data.set([]);
          this.resultsLength.set(0);
          this.error.set(this.toErrorMessage(err, 'Something went wrong while searching UMLS.'));
        }
      });

    onCleanup(() => subscription.unsubscribe());
  });

  openDialog(data: UMLSSearchResultDTO): void {
    this.dialog.open(UmlsParentGraphComponent, {
      data: data,
      width: '600px',
    });
  }

  openDetails(element: UMLSSearchResultDTO): void {
    this.expandedElement.set(this.expandedElement() === element ? null : element);
    if (this.expandedElement()) {
      this.loadDetails(element);
    } else {
      this.expandedDetail.set(null);
      this.detailError.set(null);
      this.detailLoadingUi.set(null);
    }
  }

  loadDetails(row: UMLSSearchResultDTO): void {
    this.expandedDetail.set(null);
    this.detailError.set(null);
    this.detailLoadingUi.set(row.ui);
    this.uMLSService.getUmlsDetails(row.ui)
      .pipe(finalize(() => {
        if (this.detailLoadingUi() === row.ui) {
          this.detailLoadingUi.set(null);
        }
      }))
      .subscribe({
        next: (data: UMLSDetailResultDTO) => {
          if (this.expandedElement()?.ui === row.ui) {
            this.expandedDetail.set(data);
          }
        },
        error: (err) => {
          if (this.expandedElement()?.ui === row.ui) {
            this.detailError.set(this.toErrorMessage(err, 'Something went wrong while loading UMLS details.'));
          }
        },
      });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.pageIndex.set(0);
    this.paginator()?.firstPage();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
  }

  private toErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const error = (err as { error?: unknown }).error;
      if (typeof error === 'string') return error;
      if (error) return JSON.stringify(error);
    }
    return fallback;
  }
}

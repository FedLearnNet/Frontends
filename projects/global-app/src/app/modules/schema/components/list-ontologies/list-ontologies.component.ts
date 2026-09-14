import {Component, effect, inject, signal} from '@angular/core';
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {OntologyNodeDTO, OntologySearchResponseDTO} from "../../dto/ontology";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {PaginatedResponse} from "@shared-lib/models";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {OntologyCardComponent} from "@global-app/schema/components/ontology-card/ontology-card.component";
import {MatMenuModule} from "@angular/material/menu";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {MatTooltip} from "@angular/material/tooltip";
import {
  OntologyAddDialogComponent
} from "@global-app/schema/components/ontology-add-dialog/ontology-add-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Subscription} from 'rxjs';
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-list-ontologies',
  templateUrl: './list-ontologies.component.html',
  styleUrl: './list-ontologies.component.scss',
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    RouterLink,
    MatIcon,
    TranslatePipe,
    MatPaginator,
    OntologyCardComponent,
    MatMenuModule,
    ReactiveFormsModule,
    FormsModule,
    MatInput,
    MatTooltip,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    BtnComponent
  ]
})
export class ListOntologiesComponent {
  readonly ontologyService: OntologyService = inject(OntologyService);
  private readonly dialog: MatDialog = inject(MatDialog);

  filterMode = signal<'rag' | 'list' | 'graph'>('list');
  maxResults = signal<number>(3);

  search = signal<string>('');
  readonly debouncedSearch = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalCount = signal<number>(0);
  readonly items = signal<OntologySearchResponseDTO[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private readonly DEBOUNCE_TIME_MS = 400;

  private readonly searchDebounceEffect = effect((onCleanup) => {
    const term = this.search();
    const debounceTimer = setTimeout(() => {
      this.debouncedSearch.set(term.trim());
    }, this.DEBOUNCE_TIME_MS);

    onCleanup(() => {
      clearTimeout(debounceTimer);
    });
  });

  private readonly loadEffect = effect((onCleanup) => {
    const debouncedTerm = this.debouncedSearch();
    const currentSearch = this.search().trim();
    const page = this.pageIndex();
    const size = this.pageSize();
    const filterMode = this.filterMode();
    const maxResults = this.maxResults();

    if (debouncedTerm !== currentSearch) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    let sub: Subscription | null = null;
    if (filterMode === 'rag') {
      sub = this.ontologyService
        .getAllEmbeddingSearch(debouncedTerm, maxResults)
        .subscribe({
          next: (res: OntologySearchResponseDTO[]) => {
            this.items.set(res);
            this.totalCount.set(res?.length ?? 0);
            this.loading.set(false);
          },
          error: (err) => {
            this.items.set([]);
            this.error.set(err?.message ?? 'Error loading concepts.');
            this.loading.set(false);
          },
        });
    } else if (filterMode === 'list') {
      sub = this.ontologyService
        .getAllFiltered(debouncedTerm, page, size)
        .subscribe({
          next: (res: PaginatedResponse<OntologyNodeDTO>) => {
            const results = res.results ?? [];
            this.items.set(results.map(r => ({
              node: r
            })));
            this.totalCount.set(res.totalCount ?? 0);

            const nextPage = res.page ?? page;
            const nextPageSize = res.pageSize ?? size;

            if (nextPage !== this.pageIndex()) {
              this.pageIndex.set(nextPage);
            }
            if (nextPageSize !== this.pageSize()) {
              this.pageSize.set(nextPageSize);
            }

            this.loading.set(false);
          },
          error: (err) => {
            this.items.set([]);
            this.totalCount.set(0);
            this.error.set(err?.message ?? 'Error loading concepts.');
            this.loading.set(false);
          },
        });
    } else {
      this.loading.set(false);
    }

    onCleanup(() => {
      sub?.unsubscribe();
    });
  });

  onSearchChange(filterValue: string) {
    this.search.set(filterValue);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  setFilterMode(mode: 'rag' | 'list'): void {
    this.filterMode.set(mode);
    this.pageIndex.set(0);
  }

  addViaDialog(): void {
    this.dialog.open(OntologyAddDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });

  }

}

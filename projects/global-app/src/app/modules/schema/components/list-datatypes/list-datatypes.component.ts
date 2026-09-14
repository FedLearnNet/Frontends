import {Component, effect, inject, input, signal} from '@angular/core';
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {DataTypeNodeDTO} from "../../dto/datatype";
import {DatatypeCardComponent} from '../datatype-card/datatype-card.component';
import {PaginatedResponse} from "@shared-lib/models";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {ReactiveFormsModule} from "@angular/forms";
import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {PageWrapperComponent} from "@shared-lib/components/page-wrapper/page-wrapper.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {Router} from "@angular/router";
import {InfoCardComponent} from "@shared-lib/components/info-card/info-card.component";

@Component({
  selector: 'app-list-datatypes',
  templateUrl: './list-datatypes.component.html',
  styleUrl: './list-datatypes.component.scss',
  imports: [DatatypeCardComponent, MatPaginator, ReactiveFormsModule, HeaderComponent, PageWrapperComponent, EmptyStateComponent, InfoCardComponent]
})
export class ListDatatypesComponent {
  readonly dataTypeService: DataTypeService = inject(DataTypeService);
  private readonly router = inject(Router);

  readonly ontologyId = input<string>();
  readonly hideToolbar = input<boolean>();

  readonly search = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);
  readonly totalCount = signal<number>(0);
  readonly items = signal<DataTypeNodeDTO[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);


  private readonly loadEffect = effect(() => {
    const ontologyId = this.ontologyId();
    const page = this.pageIndex();
    const size = this.pageSize();
    const term = this.search().trim();

    this.loading.set(true);
    this.error.set(null);
    const sub = this.dataTypeService
      .getAll(page, size, ontologyId, term)
      .subscribe({
        next: (res: PaginatedResponse<DataTypeNodeDTO>) => {
          const results = res.results ?? [];
          this.items.set(results);
          this.totalCount.set(res.totalCount ?? 0);
          this.pageIndex.set(res.page ?? page);
          this.pageSize.set(res.pageSize ?? size);
          this.loading.set(false);
        },
        error: (err) => {
          this.items.set([]);
          this.totalCount.set(0);
          this.error.set(err?.message ?? 'Error loading concepts.');
          this.loading.set(false);
        },
      });

    return () => sub.unsubscribe();
  });

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSearchChange(filterValue: string) {
    this.search.set(filterValue);
    this.pageIndex.set(0);
  }

  openCreatePage(): void {
    const ontologyId = this.ontologyId();
    this.router.navigate(
      ['/data-modelling/data-types/create'],
      {queryParams: ontologyId ? {ontologyId} : undefined}
    );
  }

}

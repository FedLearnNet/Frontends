import {Component, effect, inject, signal} from '@angular/core';
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {OntologyCardComponent} from "@global-app/schema/components/ontology-card/ontology-card.component";
import {ReactiveFormsModule} from "@angular/forms";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {OntologyService} from "@global-app/schema/services/ontology.service";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {PaginatedResponse} from "@shared-lib/models";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-ontology-select-dialog',
  imports: [
    ErrorCardComponent,
    MatFormField,
    MatInput,
    MatLabel,
    MatPaginator,
    OntologyCardComponent,
    ReactiveFormsModule,
    SkeletonLoaderComponent,
    CloseableDialogTitleComponent,
    TranslatePipe
  ],
  templateUrl: './ontology-select-dialog.component.html',
  styleUrl: './ontology-select-dialog.component.scss',
})
export class OntologySelectDialogComponent {
  private readonly dialogRef: MatDialogRef<OntologySelectDialogComponent> = inject(MatDialogRef<OntologySelectDialogComponent>);

  readonly ontologyService: OntologyService = inject(OntologyService);

  readonly search = signal<string>('');
  readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(20);
  readonly totalCount = signal<number>(0);
  readonly items = signal<OntologyNodeDTO[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);


  private readonly loadEffect = effect(() => {
    const term = this.search().trim();
    const page = this.pageIndex();
    const size = this.pageSize();

    const sub = this.ontologyService
      .getAllFiltered(term, page, size)
      .subscribe({
        next: (res: PaginatedResponse<OntologyNodeDTO>) => {
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

  onSearchChange(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search.set(filterValue);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  select(node: OntologyNodeDTO) {
    this.dialogRef.close(node);
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}

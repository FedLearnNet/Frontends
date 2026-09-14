import {Component, computed, effect, inject, input, model, output} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {LocalStorageService} from '@shared-lib/services/local-storage.service';

@Component({
  selector: 'app-lib-mat-paginator',
  templateUrl: './mat-paginator.component.html',
  styleUrl: './mat-paginator.component.scss',
  imports: [
    MatPaginator
  ]
})
export class MatPaginatorComponent {
  private readonly localStorage: LocalStorageService = inject(LocalStorageService);

  tableName = input<string>();
  length = input<number>(0);
  disabled = input<boolean>(false);
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  showFirstLastButtons = input<boolean>(false);

  pageSize = model<number>(50);
  pageIndex = model<number>(0);

  page = output<PageEvent>();

  localStorageKey = computed(() => `${this.tableName()}-page-size`);

  constructor() {
    const raw = this.localStorage.getItem(this.localStorageKey());
    const fromStore = Number.parseInt(raw as any, 10);
    if (!Number.isNaN(fromStore) && fromStore > 0) {
      this.pageSize.set(fromStore);
    }

    effect(() => {
      const key = this.localStorageKey();
      const size = this.pageSize();
      // Speichern nur wenn sinnvoll
      if (key && size > 0) {
        this.localStorage.setItem(key, String(size));
      }
    });
  }

  onPageEvent(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.page.emit(event);
  }
}

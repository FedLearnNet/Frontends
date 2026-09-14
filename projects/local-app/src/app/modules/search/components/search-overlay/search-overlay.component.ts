import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subject, debounceTime, distinctUntilChanged} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {SearchActions} from '../../store/search.actions';
import {selectLoading, selectQuery, selectResults} from '../../store/search.selectors';
import {SearchResultDTO} from '../../dto/search-result';
import {searchResultMeta} from '../../constants/search-navigation';
import {SearchResultCardComponent} from '../search-result-card/search-result-card.component';

export interface SearchOverlayData {
  query?: string;
}

const SEARCH_LIMIT = 20;

@Component({
  selector: 'app-search-overlay',
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.scss',
  imports: [FormsModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule, TranslatePipe, SearchResultCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchOverlayComponent {
  private readonly store: Store = inject(Store);
  private readonly router: Router = inject(Router);
  private readonly dialogRef: MatDialogRef<SearchOverlayComponent> = inject(MatDialogRef);
  private readonly data: SearchOverlayData | null = inject(MAT_DIALOG_DATA, {optional: true});

  readonly term = signal<string>('');
  readonly activeIndex = signal<number>(0);

  readonly results = this.store.selectSignal(selectResults);
  readonly loading = this.store.selectSignal(selectLoading);
  readonly storedQuery = this.store.selectSignal(selectQuery);

  readonly hasTerm = computed(() => this.term().trim().length > 0);
  readonly showEmpty = computed(() =>
    this.hasTerm() && !this.loading() && this.results().length === 0 && this.storedQuery() === this.term().trim()
  );

  private readonly termChanges = new Subject<string>();

  constructor() {
    this.termChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    ).subscribe(query => {
      const trimmed = query.trim();
      if (trimmed) {
        this.store.dispatch(SearchActions.search({query: trimmed, limit: SEARCH_LIMIT}));
      } else {
        this.store.dispatch(SearchActions.clear());
      }
    });

    effect(() => {
      const count = this.results().length;
      if (this.activeIndex() >= count) {
        this.activeIndex.set(0);
      }
    });

    const initial = this.data?.query ?? '';
    if (initial) {
      this.term.set(initial);
      this.termChanges.next(initial);
    }
  }

  onTermChange(value: string): void {
    this.term.set(value);
    this.activeIndex.set(0);
    this.termChanges.next(value);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.results().length;
    switch (event.key) {
      case 'ArrowDown':
        if (count) {
          event.preventDefault();
          this.activeIndex.update(i => (i + 1) % count);
        }
        break;
      case 'ArrowUp':
        if (count) {
          event.preventDefault();
          this.activeIndex.update(i => (i - 1 + count) % count);
        }
        break;
      case 'Enter': {
        const item = this.results()[this.activeIndex()];
        if (item) {
          event.preventDefault();
          this.open(item);
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }

  open(item: SearchResultDTO): void {
    const route = searchResultMeta(item.type).route(item);
    if (!route) {
      return;
    }
    this.dialogRef.close();
    this.router.navigate(route);
  }

  close(): void {
    this.dialogRef.close();
  }
}

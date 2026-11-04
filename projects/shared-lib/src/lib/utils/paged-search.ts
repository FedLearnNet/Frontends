import {DestroyRef, inject, signal} from '@angular/core';
import {debounceTime, filter, map, Observable, Subject, Subscription} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PaginatedResponse} from '../models/paginated-response';

export interface PagedSearchOptions {
  pageSize?: number;
  debounceMs?: number;
  maxItems?: number;
}

export type PagedFetchFn<T> = (search: string, page: number, pageSize: number) => Observable<PaginatedResponse<T>>;

/**
 * Signal-based state for a server-side searchable, paginated list (e.g. an autocomplete with infinite scroll).
 * Loads the first page immediately; `search()` restarts from page 0 (debounced), `loadMore()` appends the next page
 * until `maxItems` is reached, after which `limitReached` signals that the user should refine the search.
 * `reload()` starts over with an empty search, e.g. when an outside filter used by `fetchPage` changes.
 * Must be called in an injection context.
 */
export function pagedSearch<T>(fetchPage: PagedFetchFn<T>, options: PagedSearchOptions = {}) {
  const pageSize = options.pageSize ?? 20;
  const maxItems = options.maxItems ?? 200;
  const destroyRef = inject(DestroyRef);

  const items = signal<T[]>([]);
  const loading = signal<boolean>(false);
  const hasMore = signal<boolean>(true);
  const totalCount = signal<number>(0);
  const limitReached = signal<boolean>(false);
  const query = signal<string>('');

  let term = '';
  let page = 0;
  let request: Subscription | undefined;

  const load = () => {
    request?.unsubscribe();
    loading.set(true);
    const requestedPage = page;
    request = fetchPage(term, requestedPage, pageSize).subscribe({
      next: res => {
        const results = res?.results ?? [];
        const merged = requestedPage === 0 ? results : [...items(), ...results];
        const serverHasMore = results.length === pageSize && (requestedPage + 1) * pageSize < (res?.totalCount ?? Infinity);
        const capped = merged.length >= maxItems && (serverHasMore || merged.length > maxItems);
        items.set(merged.slice(0, maxItems));
        totalCount.set(res?.totalCount ?? 0);
        limitReached.set(capped);
        hasMore.set(serverHasMore && !capped);
        loading.set(false);
      },
      error: () => {
        hasMore.set(false);
        loading.set(false);
      }
    });
  };

  const terms = new Subject<string>();
  terms.pipe(
    debounceTime(options.debounceMs ?? 250),
    map(t => (t ?? '').trim()),
    filter(t => t !== term),
    takeUntilDestroyed(destroyRef)
  ).subscribe(t => restart(t));

  function restart(t: string) {
    term = t;
    query.set(t);
    page = 0;
    hasMore.set(true);
    limitReached.set(false);
    load();
  }

  destroyRef.onDestroy(() => request?.unsubscribe());
  load();

  return {
    items: items.asReadonly(),
    loading: loading.asReadonly(),
    hasMore: hasMore.asReadonly(),
    totalCount: totalCount.asReadonly(),
    limitReached: limitReached.asReadonly(),
    query: query.asReadonly(),
    search: (value: string) => terms.next(value),
    reload: () => restart(''),
    loadMore: () => {
      if (loading() || !hasMore()) return;
      page++;
      load();
    }
  };
}

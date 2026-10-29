import {afterNextRender, DestroyRef, Directive, inject, Injector, input, output} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatAutocomplete} from '@angular/material/autocomplete';
import {filter, fromEvent, Subscription} from 'rxjs';

/**
 * Emits `scrolledToEnd` when the user scrolls near the bottom of a mat-autocomplete panel.
 *
 * <mat-autocomplete appAutocompleteInfiniteScroll (scrolledToEnd)="source.loadMore()">
 */
@Directive({
  selector: 'mat-autocomplete[appAutocompleteInfiniteScroll]'
})
export class AutocompleteInfiniteScrollDirective {
  private readonly autocomplete = inject(MatAutocomplete);
  private readonly injector = inject(Injector);

  /** Distance in px from the bottom of the panel at which `scrolledToEnd` fires. */
  readonly scrollThreshold = input<number>(48);
  readonly scrolledToEnd = output<void>();

  private scrollSub?: Subscription;

  constructor() {
    this.autocomplete.opened.pipe(takeUntilDestroyed()).subscribe(() => this.attach());
    this.autocomplete.closed.pipe(takeUntilDestroyed()).subscribe(() => this.detach());
    inject(DestroyRef).onDestroy(() => this.detach());
  }

  private attach(): void {
    this.detach();
    const panel: HTMLElement | undefined = this.autocomplete.panel?.nativeElement;
    if (!panel) {
      // The panel view query may resolve only after the overlay has rendered.
      afterNextRender(() => this.autocomplete.isOpen && this.attach(), {injector: this.injector});
      return;
    }
    this.scrollSub = fromEvent(panel, 'scroll', {passive: true}).pipe(
      filter(() => panel.scrollHeight - panel.scrollTop - panel.clientHeight <= this.scrollThreshold())
    ).subscribe(() => this.scrolledToEnd.emit());
  }

  private detach(): void {
    this.scrollSub?.unsubscribe();
    this.scrollSub = undefined;
  }
}

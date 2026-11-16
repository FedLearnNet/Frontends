import {ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {SkeletonLoaderComponent} from '@shared-lib/components/skeleton-loader/skeleton-loader.component';
import {CohortStore} from '@local-app/cohort/services/cohort.store';

/**
 * Component of the `cohort/:cohortId` route. Loads the cohort into {@link CohortStore} and renders the
 * child routes only once it is available, so child pages can rely on `store.cohort()` being set.
 */
@Component({
  selector: 'app-cohort-shell',
  imports: [RouterOutlet, ErrorCardComponent, SkeletonLoaderComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (store.cohort()) {
      <router-outlet/>
    } @else if (store.error()) {
      <lib-error-card [errorObject]="store.error()"/>
    } @else {
      <lib-skeleton-loader/>
    }
  `,
})
export class CohortShellComponent {
  protected readonly store = inject(CohortStore);

  /** Bound from the `:cohortId` path parameter (`withComponentInputBinding`). */
  readonly cohortId = input.required<string>();

  constructor() {
    effect(() => this.store.cohortId.set(this.cohortId()));
    inject(DestroyRef).onDestroy(() => this.store.cohortId.set(null));
  }
}

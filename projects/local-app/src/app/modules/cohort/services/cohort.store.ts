import {computed, inject, Injectable, linkedSignal, signal, Signal, WritableSignal} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {CohortDetailDto} from '@local-app/cohort/models';
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {UNIQUE_PATIENT_ID_NODE} from '@local-app/utils/constants/unique-patient-id-node';

/**
 * Holds the cohort of the `cohort/:cohortId` route subtree.
 *
 * `CohortShellComponent` owns the lifecycle: it sets {@link cohortId} when the route is entered and
 * clears it when the route is left, so every visit loads a fresh cohort.
 *
 * `cohort` is the backend DTO. Never add UI-only nodes to it; use {@link cohortWithUniquePatientId}.
 */
@Injectable({providedIn: 'root'})
export class CohortStore {
  private readonly cohortService = inject(CohortService);

  readonly cohortId: WritableSignal<string | null> = signal<string | null>(null);

  private readonly resource = rxResource({
    params: () => this.cohortId() || undefined,
    stream: ({params}) => this.cohortService.getCohortById(params),
  });

  /**
   * The loaded cohort. It is writable so that edits made on the overview (name, members, deletion
   * state) reach every other page without a refetch. It resets to the backend value on `reload()`.
   */
  readonly cohort: WritableSignal<CohortDetailDto | undefined> = linkedSignal(
    () => this.resource.hasValue() ? this.resource.value() : undefined
  );

  readonly isLoading: Signal<boolean> = this.resource.isLoading;
  readonly error: Signal<Error | undefined> = this.resource.error;

  /** The cohort schema extended with the synthetic "Unique Patient ID" node the connector mapper maps to. */
  readonly cohortWithUniquePatientId: Signal<CohortDetailDto | undefined> = computed(() => {
    const cohort = this.cohort();
    if (!cohort) {
      return undefined;
    }
    const children = cohort.schemaRoot?.childNodes ?? [];
    if (children.some(node => node.globalId === UNIQUE_PATIENT_ID_NODE.globalId)) {
      return cohort;
    }
    return {
      ...cohort,
      schemaRoot: {...cohort.schemaRoot, childNodes: [...children, UNIQUE_PATIENT_ID_NODE]},
    };
  });

  reload(): void {
    this.resource.reload();
  }
}

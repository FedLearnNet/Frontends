import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {CohortDetailDto} from '@local-app/cohort/models';
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {CohortStore} from '@local-app/cohort/services/cohort.store';
import {UNIQUE_PATIENT_ID_NODE} from '@local-app/utils/constants/unique-patient-id-node';

describe('CohortStore', () => {
  let getCohortById: jasmine.Spy;
  let store: CohortStore;

  const backendCohort = (id: number): CohortDetailDto => ({
    id,
    name: `Cohort ${id}`,
    schemaRoot: {childNodes: [{globalId: 'age', name: 'Age', childNodes: []}]},
  } as unknown as CohortDetailDto);

  async function settle(): Promise<void> {
    TestBed.tick();
    await Promise.resolve();
    TestBed.tick();
  }

  beforeEach(() => {
    getCohortById = jasmine.createSpy('getCohortById').and.callFake((id: string) => of(backendCohort(Number(id))));
    TestBed.configureTestingModule({
      providers: [{provide: CohortService, useValue: {getCohortById}}],
    });
    store = TestBed.inject(CohortStore);
  });

  it('does not load anything until a cohort id is set', async () => {
    await settle();

    expect(store.cohort()).toBeUndefined();
    expect(getCohortById).not.toHaveBeenCalled();
  });

  it('loads the cohort of the current id and drops it when the id is cleared', async () => {
    store.cohortId.set('1');
    await settle();

    expect(store.cohort()?.name).toBe('Cohort 1');

    store.cohortId.set(null);
    await settle();

    expect(store.cohort()).toBeUndefined();
  });

  it('never exposes the previous cohort while another one is loading', async () => {
    store.cohortId.set('1');
    await settle();
    store.cohortId.set('2');
    TestBed.tick();

    expect(store.cohort()?.id).not.toBe(1);

    await settle();
    expect(store.cohort()?.id).toBe(2);
  });

  it('adds the Unique Patient ID node to a copy, never to the shared cohort', async () => {
    store.cohortId.set('1');
    await settle();

    const withNode = store.cohortWithUniquePatientId();

    expect(withNode?.schemaRoot.childNodes.map(node => node.globalId))
      .toEqual(['age', UNIQUE_PATIENT_ID_NODE.globalId]);
    // Regression: the mapper used to push the node into the shared cohort, so the patient pages showed an empty field.
    expect(store.cohort()?.schemaRoot.childNodes.map(node => node.globalId)).toEqual(['age']);
  });

  it('keeps the same cohort when it already contains the Unique Patient ID node', async () => {
    getCohortById.and.returnValue(of({
      ...backendCohort(1),
      schemaRoot: {childNodes: [UNIQUE_PATIENT_ID_NODE]},
    }));
    store.cohortId.set('1');
    await settle();

    expect(store.cohortWithUniquePatientId()).toBe(store.cohort());
  });
});

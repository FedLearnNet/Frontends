import {Component, computed, input} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router, Routes, withComponentInputBinding, withRouterConfig, withRouterResources} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {of, Subject, throwError} from 'rxjs';
import {CohortDetailDto} from '@local-app/cohort/models';
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {cohortBreadcrumb, cohortRouteResources, CohortResource} from '@local-app/cohort/services/cohort-route-resources';
import {UNIQUE_PATIENT_ID_NODE, withUniquePatientIdNode} from '@local-app/utils/constants/unique-patient-id-node';

@Component({template: ''})
class OverviewStubComponent {
  readonly cohortResource = input.required<CohortResource>();
  readonly cohort = computed(() => this.cohortResource().hasValue() ? this.cohortResource().value() : undefined);
}

@Component({template: ''})
class ConnectorsStubComponent {
  readonly cohortResource = input.required<CohortResource>();
  readonly cohort = computed(() => this.cohortResource().hasValue() ? this.cohortResource().value() : undefined);
}

describe('cohort route resource (non-blocking, declared per page route)', () => {
  let getCohortById: jasmine.Spy;
  let harness: RouterTestingHarness;

  const backendCohort = (id: number): CohortDetailDto => ({
    id,
    name: `Cohort ${id}`,
    schemaRoot: {childNodes: [{globalId: 'age', name: 'Age', childNodes: []}]},
  } as unknown as CohortDetailDto);

  const routes: Routes = [{
    path: 'cohort/:cohortId',
    data: {breadcrumb: cohortBreadcrumb},
    children: [
      {path: '', component: OverviewStubComponent, resources: cohortRouteResources},
      {
        path: 'connector',
        children: [{path: '', component: ConnectorsStubComponent, resources: cohortRouteResources}],
      },
    ],
  }];

  async function settle(): Promise<void> {
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  // `settle()` would wait forever for a load that is still pending (a pending resource is a pending task).
  async function tick(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve));
    harness.detectChanges();
  }

  beforeEach(async () => {
    getCohortById = jasmine.createSpy('getCohortById').and.callFake((id: string) => of(backendCohort(Number(id))));
    TestBed.configureTestingModule({
      providers: [
        {provide: CohortService, useValue: {getCohortById}},
        provideRouter(routes, withComponentInputBinding(), withRouterResources(),
          withRouterConfig({paramsInheritanceStrategy: 'always'})),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  it('gives the page its own route resource with the loaded cohort in value()', async () => {
    const overview = await harness.navigateByUrl('/cohort/1', OverviewStubComponent);
    await settle();

    expect(getCohortById).toHaveBeenCalledOnceWith('1');
    expect(overview.cohortResource().value()?.name).toBe('Cohort 1');
    expect(overview.cohort()?.name).toBe('Cohort 1');
  });

  it('activates the page while loading and exposes the loading state', async () => {
    const pending = new Subject<CohortDetailDto>();
    getCohortById.and.returnValue(pending);

    const overview = await harness.navigateByUrl('/cohort/1', OverviewStubComponent);
    await tick();

    expect(overview.cohortResource().isLoading()).toBeTrue();
    expect(overview.cohort()).toBeUndefined();

    pending.next(backendCohort(1));
    await settle();

    expect(overview.cohortResource().isLoading()).toBeFalse();
    expect(overview.cohort()?.name).toBe('Cohort 1');
  });

  it('exposes a failed load through error() without throwing', async () => {
    const failure = new Error('404');
    getCohortById.and.returnValue(throwError(() => failure));

    const overview = await harness.navigateByUrl('/cohort/1', OverviewStubComponent);
    await settle();

    expect(overview.cohortResource().status()).toBe('error');
    expect(overview.cohortResource().error()).toBe(failure);
    expect(overview.cohort()).toBeUndefined();
  });

  it('works on a page nested below a componentless route', async () => {
    const connectors = await harness.navigateByUrl('/cohort/1/connector', ConnectorsStubComponent);
    await settle();

    expect(connectors.cohort()?.id).toBe(1);
  });

  it('loads the cohort of the new id when :cohortId changes', async () => {
    await harness.navigateByUrl('/cohort/1', OverviewStubComponent);
    await settle();

    const overview = await harness.navigateByUrl('/cohort/2', OverviewStubComponent);
    await settle();

    expect(getCohortById.calls.allArgs()).toEqual([['1'], ['2']]);
    expect(overview.cohort()?.id).toBe(2);
  });

  it('refetches on reload() and updates value()', async () => {
    const overview = await harness.navigateByUrl('/cohort/1', OverviewStubComponent);
    await settle();
    getCohortById.and.returnValue(of({...backendCohort(1), name: 'Renamed'}));

    overview.cohortResource().reload();
    await settle();

    expect(overview.cohort()?.name).toBe('Renamed');
  });

  it('provides the cohort name to the breadcrumb once loaded, from the page resource', async () => {
    await harness.navigateByUrl('/cohort/1/connector', ConnectorsStubComponent);
    const cohortRoute = TestBed.inject(Router).routerState.snapshot.root.firstChild!;
    const names: (string | null)[] = [];

    TestBed.runInInjectionContext(() => cohortBreadcrumb(cohortRoute.data, cohortRoute)).subscribe(name => names.push(name));
    await settle();

    expect(names).toEqual(['Cohort 1']);
    expect(getCohortById).toHaveBeenCalledTimes(1);
  });

  it('lets the breadcrumb complete without a name when loading fails', async () => {
    getCohortById.and.returnValue(throwError(() => new Error('404')));
    await harness.navigateByUrl('/cohort/1', OverviewStubComponent);
    const cohortRoute = TestBed.inject(Router).routerState.snapshot.root.firstChild!;
    const names: (string | null)[] = [];

    TestBed.runInInjectionContext(() => cohortBreadcrumb(cohortRoute.data, cohortRoute)).subscribe(name => names.push(name));
    await settle();

    expect(names).toEqual([null]);
  });
});

describe('withUniquePatientIdNode', () => {
  const cohort = {
    id: 1,
    schemaRoot: {childNodes: [{globalId: 'age', name: 'Age', childNodes: []}]},
  } as unknown as CohortDetailDto;

  it('appends the node to a copy and never changes the shared cohort', () => {
    const result = withUniquePatientIdNode(cohort);

    expect(result.schemaRoot.childNodes.map(node => node.globalId)).toEqual(['age', UNIQUE_PATIENT_ID_NODE.globalId]);
    // Regression: the mapper used to push the node into the shared cohort, so the patient pages showed an empty field.
    expect(cohort.schemaRoot.childNodes.map(node => node.globalId)).toEqual(['age']);
  });

  it('returns the same cohort when it already has the node', () => {
    const withNode = withUniquePatientIdNode(cohort);

    expect(withUniquePatientIdNode(withNode)).toBe(withNode);
  });
});

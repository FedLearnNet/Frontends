import {effect, inject, Injector, Resource, WritableResource} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {ActivatedRouteSnapshot, nonBlocking, Route} from '@angular/router';
import {Observable} from 'rxjs';
import {CohortDetailDto} from '@local-app/cohort/models';
import {CohortService} from '@local-app/cohort/services/cohort.service';

type RouteResourceContext = Parameters<NonNullable<Route['resources']>>[0];
export type CohortResource = Resource<CohortDetailDto | undefined> & Pick<WritableResource<CohortDetailDto | undefined>, 'reload'>;

export function cohortRouteResources(ctx: RouteResourceContext) {
  const cohortService = inject(CohortService);
  return {
    cohortResource: nonBlocking(rxResource({
      params: () => ctx.params()['cohortId'] as string,
      stream: ({params}) => cohortService.getCohortById(params),
    })),
  };
}

export function cohortBreadcrumb(_data: unknown, route: ActivatedRouteSnapshot): Observable<string | null> {
  let resource: CohortResource | undefined;
  for (let page = route.firstChild; page && !resource; page = page.firstChild) {
    resource = page.resources?.['cohortResource'] as CohortResource | undefined;
  }
  const injector = inject(Injector);
  return new Observable<string | null>(subscriber => {
    if (!resource) {
      subscriber.next(null);
      subscriber.complete();
      return;
    }
    const watcher = effect(() => {
      if (resource.hasValue() && resource.value()?.name) {
        subscriber.next(resource.value()!.name);
        subscriber.complete();
      } else if (resource.status() === 'error') {
        subscriber.next(null);
        subscriber.complete();
      }
    }, {injector});
    return () => watcher.destroy();
  });
}

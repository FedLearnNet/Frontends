import { inject, Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Observable, of, from, forkJoin } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Breadcrumb } from '@shared-lib/models/breadcrumb';

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
    private router = inject(Router);
    private _breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

    public breadcrumbs$ = this._breadcrumbs$.asObservable();

    constructor() {
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            switchMap(() => this.buildBreadcrumbsFromRoute(this.router.routerState.snapshot.root))
        ).subscribe(bc => this._breadcrumbs$.next(bc));
    }

    private buildBreadcrumbsFromRoute(root: ActivatedRouteSnapshot): Observable<Breadcrumb[]> {
        const breadcrumbs: Breadcrumb[] = [];
        return this.traverse(root, '', breadcrumbs).pipe(switchMap(() => of(breadcrumbs)));
    }

    private traverse(route: ActivatedRouteSnapshot, parentUrl: string, acc: Breadcrumb[]): Observable<void> {
        const children = route.children || [];
        const thisSegment = route.url.map(s => s.path).join('/');
        const nextUrl = thisSegment ? `${parentUrl}/${thisSegment}` : parentUrl;

        const data = route.data || {};
        const bcData = data['breadcrumb'];

        const label$ = this.resolveBreadcrumbLabel(bcData, route);

        const shouldAdd =
            bcData !== undefined &&
            !(thisSegment === '' && acc.length && acc[acc.length - 1].label === bcData);

        const childObservables: Observable<void>[] = [];

        if (shouldAdd) {
            childObservables.push(
                label$.pipe(
                    switchMap(label => {
                        if (label) {
                            if (!acc.length || acc[acc.length - 1].label !== label) {
                                acc.push({ label, url: nextUrl || '/' });
                            }
                        }
                        return this.traverseChildren(children, nextUrl, acc);
                    })
                )
            );
        } else {
            childObservables.push(this.traverseChildren(children, nextUrl, acc));
        }

        return forkJoin(childObservables.length ? childObservables : [of(void 0)]).pipe(switchMap(() => of(void 0)));
    }

    private traverseChildren(children: ActivatedRouteSnapshot[], parentUrl: string, acc: Breadcrumb[]): Observable<void> {
        if (!children || children.length === 0) return of(void 0);

        const primary = children.find(c => c.outlet === 'primary');
        if (primary) return this.traverse(primary, parentUrl, acc);

        const all = children.map(c => this.traverse(c, parentUrl, acc));
        return forkJoin(all).pipe(switchMap(() => of(void 0)));
    }

    private resolveBreadcrumbLabel(bcData: any, route: ActivatedRouteSnapshot): Observable<string | null> {
        if (typeof bcData === 'string') return of(bcData);
        if (typeof bcData === 'function') {
            try {
                const result = bcData(route.data);
                if (result == null) return of(null);
                if (typeof result === 'string') return of(result);
                if (result instanceof Promise) return from(result).pipe() as Observable<string | null>;
                if (result && typeof result.subscribe === 'function') return result as Observable<string | null>;
                return of(String(result));
            } catch {
                return of(null);
            }
        }
        if (bcData && typeof bcData.subscribe === 'function') return bcData as Observable<string | null>;
        if (bcData && typeof bcData.then === 'function') return from(bcData as Promise<string | null>);
        return of(null);
    }
}

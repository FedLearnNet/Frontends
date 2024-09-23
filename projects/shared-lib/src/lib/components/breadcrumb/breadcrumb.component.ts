import { Component, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, Data, Router } from '@angular/router';

type RouteData = Data & { breadcrumb: string | any }
type ExtendedActivatedRouteSnapshot = ActivatedRouteSnapshot & { data: RouteData }

@Component({
  selector: 'app-lib-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: { label: string, url: string }[] = [];

  constructor(
      private router: Router,
  ) {}

  ngOnInit(): void {
    this.initBreadcrumb();
  }

  private initBreadcrumb(): void {
    this.addBreadcrumb(this.router.routerState.snapshot.root as ExtendedActivatedRouteSnapshot, [], this.breadcrumbs);
  }

  private addBreadcrumb(route: ActivatedRouteSnapshot | null, parentUrl: string[], breadcrumbs: any[]): void {
    if (!route) {
      return;
    }

    const routeUrl = parentUrl.concat(route.url.map(url => url.path));
    const routeData = route.data as RouteData;

    if (routeData.breadcrumb) {
      const url = `/${routeUrl.join('/')}`;

      if (!breadcrumbs.find(breadcrumb => breadcrumb.url === url)) {
        const breadcrumb = {
          label: BreadcrumbComponent.getLabel(routeData),
          url: url,
        };

        breadcrumbs.push(breadcrumb);
      }
    }

    this.addBreadcrumb(route.firstChild, routeUrl, breadcrumbs);
  }

  private static getLabel(data: RouteData): string {
    return typeof data.breadcrumb === 'function' ? data.breadcrumb(data) : data.breadcrumb;
  }
}

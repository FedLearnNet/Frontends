import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Breadcrumb } from '@shared-lib/models/breadcrumb';
import { BreadcrumbService } from '@shared-lib/services/breadcrumb.service';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-lib-breadcrumb',
    standalone: true,
    imports: [
        AsyncPipe,
        RouterLink,
    ],
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {
    breadcrumbs$: Observable<Breadcrumb[]>;

    private breadcrumbService = inject(BreadcrumbService);

    constructor() {
        this.breadcrumbs$ = this.breadcrumbService.breadcrumbs$;
    }
}

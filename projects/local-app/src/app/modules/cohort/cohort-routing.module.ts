import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CohortComponent } from './cohort.component';
import { CohortDashboardComponent } from './components/cohort-dashboard/cohort-dashboard.component';
import { CohortOverviewComponent } from './components/cohort-overview/cohort-overview.component';
import { schemaListResolver, schemaResolver, schemaHeadListResolver } from '@local-app/cohort/services/schema-resolver.service';
import { schemaDataListResolver } from '@local-app/cohort/services/schema-data-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: CohortComponent,
        children: [
            {
                path: '',
                component: CohortDashboardComponent,
                pathMatch: 'full',
                resolve: { schemas: schemaListResolver },
            },
            {
                path: 'new',
                component: CohortOverviewComponent,
                resolve: { schemaHeadList: schemaHeadListResolver },
                data: { breadcrumb: 'New' },
            },
            {
                path: 'edit/:schemaId',
                component: CohortOverviewComponent,
                resolve: { schema: schemaResolver, allData: schemaDataListResolver },
                data: { breadcrumb: (data: any) => data.schema.name },
            },
        ],
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class CohortRoutingModule {}

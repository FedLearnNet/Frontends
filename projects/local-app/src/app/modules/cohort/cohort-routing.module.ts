import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CohortComponent } from './cohort.component';
import { CohortDashboardComponent } from './components/dashboard/dashboard.component';
import { AddCohortComponent } from './components/add-cohort/add-cohort.component';
import { ShowCohortComponent } from './components/show-cohort/show-cohort.component';
import { cohortListResolver, cohortResolver } from '@local-app/cohort/services/cohort-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: CohortComponent,
        children: [
            { path: '', component: CohortDashboardComponent, pathMatch: 'full', resolve: { cohorts: cohortListResolver } },
            { path: 'new', component: AddCohortComponent },
            { path: 'edit/:cohort-id', component: AddCohortComponent, resolve: { cohort: cohortResolver } },
            { path: 'show/:cohort-id', component: ShowCohortComponent, resolve: { cohort: cohortResolver } },
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

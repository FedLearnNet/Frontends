import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './utils/components/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full' ,
        component: DashboardComponent,
    },
    {
        path: 'cohort',
        loadChildren: () =>
            import('../app/modules/cohort/cohort.module').then(m => m.CohortModule),
    },
    {
        path: 'data-review',
        loadChildren: () =>
            import('../app/modules/data-review/data-review.module').then(m => m.DataReviewModule),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

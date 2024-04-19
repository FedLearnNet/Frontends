import { RouterModule, Routes } from '@angular/router';
import { DataReviewComponent } from './data-review.component';
import { NgModule } from '@angular/core';
import { DataReviewDashboardComponent } from './components/dashboard/dashboard.component';
import { permissionListResolver } from '@local-app/data-review/services/permission-resolver.service';
import { trainingListResolver } from '@local-app/data-review/services/training-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: DataReviewComponent,
        children: [
            {
                path: '',
                component: DataReviewDashboardComponent,
                resolve: { permissions: permissionListResolver, trainings: trainingListResolver },
            },
        ],
    }
]

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class DataReviewRoutingModule {
}

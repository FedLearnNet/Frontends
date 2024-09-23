import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FindDataComponent } from '@global-app/find-data/find-data.component';
import { FindDataDashboardComponent } from '@global-app/find-data/components/find-data-dashboard/find-data-dashboard.component';
import { WorkflowDashboardComponent } from '@global-app/find-data/components/workflow-dashboard/workflow-dashboard.component';
import { WorkflowDetailComponent } from '@global-app/find-data/components/workflow-detail/workflow-detail.component';
import {
    queryListResolver,
    queryConfigsResolver,
} from '@global-app/find-data/services/query-resolver.service';

const routes: Routes = [
    {
        path: '',
        component: FindDataComponent,
        children: [
            {
                path: '',
                component: FindDataDashboardComponent,
                pathMatch: 'full',
                resolve: { queryList: queryListResolver, queryConfigs: queryConfigsResolver },
            },
            {
                path: ':query-id/workflows',
                component: WorkflowDashboardComponent,
            },
            {
                path: ':query-id/workflows/new',
                component: WorkflowDetailComponent,
            },
            {
                path: ':query-id/workflows/:workflow-id/edit',
                component: WorkflowDetailComponent,
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
export class FindDataRoutingModule {
}

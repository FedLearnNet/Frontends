import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { FindDataComponent } from '@global-app/find-data/find-data.component';
import { FindDataDashboardComponent } from '@global-app/find-data/components/dashboard/dashboard.component';
import { WorkflowDashboardComponent } from '@global-app/find-data/components/workflow-dashboard/workflow-dashboard.component';
import { WorkflowDetailComponent } from '@global-app/find-data/components/workflow-dashboard/components/workflow-detail/workflow-detail.component';
import {
    queryListResolver,
    queryResolver,
    workflowStatusListResolver
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
                resolve: { queries: queryListResolver },
            },
            {
                path: ':query-id/workflows',
                component: WorkflowDashboardComponent,
                resolve: { query: queryResolver },
            },
            {
                path: ':query-id/workflows/new',
                component: WorkflowDetailComponent,
                resolve: { query: queryResolver, workflowStatuses: workflowStatusListResolver },
            },
            {
                path: ':query-id/workflows/:workflow-id/edit',
                component: WorkflowDetailComponent,
                resolve: { query: queryResolver, workflowStatuses: workflowStatusListResolver },
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

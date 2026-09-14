import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {appStoreResolver} from "@shared-lib/modules/store/service/store-resolver.service";
import {WorkflowListComponent} from "@shared-lib/modules/workflow/components/workflow-list/workflow-list.component";
import {
  WorkflowDetailPageComponent
} from "@shared-lib/modules/workflow/components/workflow-detail-page/workflow-detail-page.component";

const routes: Routes = [
  {
    path: '',
    children: [{
      path: '',
      component: WorkflowListComponent,
      pathMatch: 'full'
    },
      {
        path: ':workflow-id',
        component: WorkflowDetailPageComponent,
        pathMatch: 'full',
        resolve: {app: appStoreResolver}
      },
    ],
  }


]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule,
  ],
})
export class WorkflowRoutingModule {
}

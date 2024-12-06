import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {FindDataComponent} from '@global-app/find-data/find-data.component';
import {
  queryListResolver,
  queryConfigsResolver,
} from '@global-app/find-data/services/query-resolver.service';
import {
  FindDataDashboardComponent
} from "@global-app/find-data/components/find-data-dashboard/find-data-dashboard.component";

const routes: Routes = [
  {
    path: '',
    component: FindDataComponent,
    children: [
      {
        path: '',
        component: FindDataDashboardComponent,
        pathMatch: 'full'
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

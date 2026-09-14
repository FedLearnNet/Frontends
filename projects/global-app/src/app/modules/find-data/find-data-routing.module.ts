import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {
  FindDataDashboardComponent
} from "@global-app/find-data/components/find-data-dashboard/find-data-dashboard.component";
import {queryConfigsResolver, queryDetailResolver} from "@global-app/find-data/services/query-resolver.service";
import {QueryDetailPageComponent} from "@global-app/find-data/components/query-detail-page/query-detail-page.component";

const routes: Routes = [
  {
    path: '',
    component: FindDataDashboardComponent,
    pathMatch: 'full'
  },
  {
    path: ':queryId',
    component: QueryDetailPageComponent,
    resolve: {query: queryDetailResolver, queryConfigs: queryConfigsResolver},
    data: {breadcrumb: (data: any) => data.query?.name ?? 'Query'}
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

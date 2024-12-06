import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelStoreComponent} from '@global-app/model-store/model-store.component';
import {
  modelResolver, modelsResolver,
} from '@global-app/model-store/services/model-resolver.service';
import {ModelDetailComponent} from '@global-app/model-store/components/model-detail/model-detail.component';
import {ModelListComponent} from "@global-app/model-store/components/model-list/model-list.component";
import {LogComponent} from "./log.component";
import {LogsOverviewComponent} from "./logs-overview/logs-overview.component";

const routes: Routes = [
  {
    path: '',
    component: LogComponent,
    children: [
      {
        path: '',
        data: {breadcrumb: 'Logs'},
        children: [
          {
            path: '',
            component: LogsOverviewComponent,
            pathMatch: 'full',
          },
        ]
      },
    ]
  },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class LogRoutingModule {
}

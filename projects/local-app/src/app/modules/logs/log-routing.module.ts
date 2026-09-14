import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LogComponent} from "./log.component";
import {LogsOverviewComponent} from "./components/logs-overview/logs-overview.component";

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

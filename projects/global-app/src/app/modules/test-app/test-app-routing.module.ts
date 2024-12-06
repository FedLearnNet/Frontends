import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {TestAppComponent} from "./test-app.component";
import {AppDetailComponent} from "./components/app-detail/app-detail.component";
import {appResolver, appsResolver, myAppResolver} from "@global-app/app-store/service/app-resolver.service";
import {ExperimentDetailComponent} from "./components/experiment/experiment-detail/experiment-detail.component";
import {experimentResolver, runIdResolver} from "./service/experiment-resolver.service";
import {
  ExperimentRunDetailComponent
} from "./components/experiment/experiment-run-detail/experiment-run-detail.component";
import {ExperimentRunDTO} from "./dto/experiment";
import {AppListComponent} from "./components/app-list/app-list.component";

const routes: Routes = [
  {
    path: '',
    component: TestAppComponent,
    children: [
      {
        path: '',
        component: AppListComponent,
        pathMatch: 'full',
        resolve: {
          apps: appsResolver
        },
      },
      {
        path: ':app-id',
        resolve: {
          app: myAppResolver
        },
        data: {breadcrumb: (data: any) => data.app.name + ' (v.' + data.app.latestVersion + ')'},
        children: [
          {
            path: '',
            component: AppDetailComponent,
            pathMatch: 'full',
          },
          {
            path: 'experiment/:experimentId',
            resolve: {
              experiment: experimentResolver
            },
            data: {breadcrumb: (data: any) => data.experiment.name},
            children: [
              {
                path: '',
                component: ExperimentDetailComponent,
                pathMatch: 'full',
              },
              {
                path: 'run/:runId',
                component: ExperimentRunDetailComponent,
                pathMatch: 'full',
                resolve: {
                  runId: runIdResolver
                },
                data: {breadcrumb: (data: any) => data.experiment.runs.find((run: ExperimentRunDTO) => run.id === +data.runId).name},
              }
            ]
          },
        ]
      }
    ]
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
export class TestAppRoutingModule {
}

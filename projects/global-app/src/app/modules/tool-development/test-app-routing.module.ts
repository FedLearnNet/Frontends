import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AppDetailComponent} from "./components/app-detail/app-detail.component";
import {appsResolver, myAppResolver} from "./service/app-resolver.service";
import {ExperimentDetailComponent} from "./components/experiment/experiment-detail/experiment-detail.component";
import {experimentResolver, runIdResolver} from "./service/experiment-resolver.service";
import {
  ExperimentRunDetailComponent
} from "./components/experiment/experiment-run-detail/experiment-run-detail.component";
import {AppListComponent} from "./components/app-list/app-list.component";
import {TestRunDTO, trialNameOf, trialsOf} from "./dto/test-run";
import {
  AppRunFederatedTestDetailComponent
} from "./components/app-runs/components/app-run-federated-test-detail/app-run-federated-test-detail.component";

const routes: Routes = [
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
    data: {breadcrumb: (_data: any) => _data.app.name + ' (v.' + _data.app.latestVersion + ')'},
    children: [
      {
        path: '',
        component: AppDetailComponent,
        pathMatch: 'full',
      },
      {
        path: 'test/federated/:test-id',
        component: AppRunFederatedTestDetailComponent,
        pathMatch: 'full',
        data: {breadcrumb: (_data: any) => 'Federated Test'},
      },
      {
        path: 'experiment/:experimentId',
        resolve: {
          experiment: experimentResolver
        },
        data: {breadcrumb: (_data: any) => _data.experiment.name},
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
            data: {
              breadcrumb: (_data: any) => {
                const trial = trialsOf(_data.experiment as TestRunDTO).find(attempt => attempt.id === +_data.runId);
                return trial ? trialNameOf(trial) : '';
              }
            },
          }
        ]
      },
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

import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ProjectListsComponent} from "./components/list-projects/list-projects.component";
import {DetailProjectComponent} from "./components/detail-project/detail-project.component";
import {projectResolver} from "@global-app/project/services/project-resolver";
import {
  DetailFederatedExperimentComponent
} from "@global-app/project/components/runs/detail-federated-experiment/detail-federated-experiment.component";
import {
  DetailLocalExperimentComponent
} from "@global-app/project/components/runs/detail-local-experiment/detail-local-experiment.component";
import {
  projectFedExperimentResolver,
  projectLocalExperimentResolver
} from "@global-app/project/services/project-experiment-resolver";
import {
  DatasetBuilderPageComponent
} from "@global-app/project/components/dataset-builder-page/dataset-builder-page.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProjectListsComponent,
        pathMatch: 'full'
      },
      {
        path: ':projectId',
        resolve: {
          project: projectResolver
        },
        children: [
          {
            path: '',
            component: DetailProjectComponent,
            pathMatch: 'full'
          },
          {
            path: 'dataset-builder',
            component: DatasetBuilderPageComponent,
          },
          {
            path: 'experiments',
            children: [
              {
                path: 'federated/:experiment-id',
                component: DetailFederatedExperimentComponent,
                resolve: {
                  fedExperiment: projectFedExperimentResolver
                }
              },
              {
                path: 'local/:experiment-id',
                component: DetailLocalExperimentComponent,
                resolve: {
                  localExperiment: projectLocalExperimentResolver
                }
              }
            ]
          }
        ]
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
export class ProjectRoutingModule {
}

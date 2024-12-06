import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ProjectComponent} from "./project.component";
import {ProjectListsComponent} from "./components/list-projects/list-projects.component";
import {CreateProjectComponent} from "./components/create-project/create-project.component";
import {DetailProjectComponent} from "./components/detail-project/detail-project.component";
import {projectResolver} from "@global-app/project/services/project-resolver";

const routes: Routes = [
  {
    path: '',
    component: ProjectComponent,
    children: [{
      path: '',
      component: ProjectListsComponent,
      pathMatch: 'full'
    },
      {
        path: ':projectId',
        component: DetailProjectComponent,
        resolve: {
          project: projectResolver
        }
      }
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

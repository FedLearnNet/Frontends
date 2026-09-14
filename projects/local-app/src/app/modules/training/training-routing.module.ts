import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TrainingComponent} from './training.component';
import {TrainingListComponent} from './components/training-list/training-list.component';
import {TrainingDetailComponent} from './components/training-detail/training-detail.component';
import {federatedLearningProjectDetailResolver} from './services/federated-learning-project-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: TrainingComponent,
    children: [
      {
        path: '',
        component: TrainingListComponent,
        pathMatch: 'full'
      },
      {
        path: 'overview/:fl-request-id',
        component: TrainingDetailComponent,
        resolve: {project: federatedLearningProjectDetailResolver},
        data: {breadcrumb: 'Project Overview'}
      }
    ],
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class TrainingRoutingModule {
}

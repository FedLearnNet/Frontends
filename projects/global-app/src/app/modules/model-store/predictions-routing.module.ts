import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelStoreComponent} from '@global-app/model-store/model-store.component';
import {PredictionListComponent} from "@global-app/model-store/components/prediction-list/prediction-list.component";
import {predictionsResolver} from "@global-app/model-store/services/prediction-resolver.service";

const routes: Routes = [
  {
    path: '',
    component: ModelStoreComponent,
    children: [
      {
        path: '',
        resolve: {predictions: predictionsResolver},
        children: [
          {
            path: '',
            component: PredictionListComponent,
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
export class PredictionsRoutingModule {
}

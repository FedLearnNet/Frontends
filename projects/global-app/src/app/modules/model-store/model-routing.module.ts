import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelDetailComponent} from '@global-app/model-store/components/model-detail/model-detail.component';
import {MyModelListComponent} from "@global-app/model-store/components/my-model-list/my-model-list.component";
import {modelResolver, modelsResolver} from "@shared-lib/modules/app-execution/service/model-resolver.service";

const routes: Routes = [
  {
    path: '',
    resolve: {models: modelsResolver},
    children: [
      {
        path: '',
        component: MyModelListComponent,
        pathMatch: 'full',
      },
      {
        path: ':model-id',
        component: ModelDetailComponent,
        pathMatch: 'full',
        resolve: {model: modelResolver},
      },
    ]
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
export class ModelListRoutingModule {
}

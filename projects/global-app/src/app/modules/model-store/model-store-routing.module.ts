import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelStoreComponent} from '@global-app/model-store/model-store.component';
import {
  modelResolver, modelsResolver,
} from '@global-app/model-store/services/model-resolver.service';
import {ModelDetailComponent} from '@global-app/model-store/components/model-detail/model-detail.component';
import {ModelListComponent} from "@global-app/model-store/components/model-list/model-list.component";

const routes: Routes = [
  {
    path: '',
    component: ModelStoreComponent,
    children: [
      {
        path: '',
        resolve: {models: modelsResolver},
        data: {breadcrumb: 'Model Store'},
        children: [
          {
            path: '',
            component: ModelListComponent,
            pathMatch: 'full',
          },
          {
            path: ':model-id',
            component: ModelDetailComponent,
            pathMatch: 'full',
            resolve: {model: modelResolver},
            data: {breadcrumb: (data: any) => data.model.name},
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
export class ModelStoreRoutingModule {
}

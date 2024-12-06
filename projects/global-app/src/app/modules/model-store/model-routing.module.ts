import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ModelStoreComponent} from '@global-app/model-store/model-store.component';
import {
  modelResolver, myModelResolver,
} from '@global-app/model-store/services/model-resolver.service';
import {ModelDetailComponent} from '@global-app/model-store/components/model-detail/model-detail.component';
import {MyModelListComponent} from "@global-app/model-store/components/my-model-list/my-model-list.component";

const routes: Routes = [
  {
    path: '',
    component: ModelStoreComponent,
    children: [
      {
        path: '',
        resolve: {models: myModelResolver},
        data: {breadcrumb: 'My Models'},
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
export class ModelListRoutingModule {
}

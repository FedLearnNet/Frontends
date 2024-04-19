import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ModelStoreComponent } from '@global-app/model-store/model-store.component';
import { ModelStoreDashboardComponent } from '@global-app/model-store/components/dashboard/dashboard.component';
import {
    modelListResolver,
    modelResolver,
    predictionListResolver
} from '@global-app/model-store/services/model-resolver.service';
import { ModelDetailComponent } from '@global-app/model-store/components/store/components/model-detail/model-detail.component';

const routes: Routes = [
    {
        path: '',
        component: ModelStoreComponent,
        children: [
            {
                path: '',
                component: ModelStoreDashboardComponent,
                pathMatch: 'full',
                resolve: { models: modelListResolver, predictions: predictionListResolver }
            },
            {
                path: ':model-id',
                component: ModelDetailComponent,
                pathMatch: 'full',
                resolve: { model: modelResolver }
            },
        ],
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
export class ModelStoreRoutingModule {}

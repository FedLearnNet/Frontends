import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '@global-app/utils/components/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full' ,
        component: DashboardComponent,
    },
    {
        path: 'find-data',
        loadChildren: () =>
            import('../app/modules/find-data/find-data.module').then(m => m.FindDataModule),
    },
    {
        path: 'model-store',
        loadChildren: () =>
            import('../app/modules/model-store/model-store.module').then(m => m.ModelStoreModule),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

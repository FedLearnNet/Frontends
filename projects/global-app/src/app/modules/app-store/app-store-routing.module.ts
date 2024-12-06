import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AppStoreComponent} from "./app-store.component";
import {AppListComponent} from "./components/app-list/app-list.component";
import {AppDetailComponent} from "@global-app/app-store/components/app-detail/app-detail.component";
import {appResolver} from "@global-app/app-store/service/app-resolver.service";

const routes: Routes = [
  {
    path: '',
    component: AppStoreComponent,
    children: [{
      path: '',
      component: AppListComponent,
      pathMatch: 'full'
    },
      {
        path: ':app-id',
        component: AppDetailComponent,
        pathMatch: 'full',
        resolve: {app: appResolver}
      },],
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
export class AppStoreRoutingModule {
}

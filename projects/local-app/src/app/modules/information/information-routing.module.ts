import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InformationComponent} from './information.component';
import {NotificationListComponent} from './components/notification-list/notification-list.component';

const routes: Routes = [
  {
    path: '',
    component: InformationComponent,
    children: [
      {
        path: '',
        component: NotificationListComponent,
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InformationRoutingModule {
}

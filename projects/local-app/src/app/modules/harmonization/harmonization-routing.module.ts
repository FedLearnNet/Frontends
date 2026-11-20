import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HarmonizationListComponent} from './components/harmonization-list/harmonization-list.component';
import {HarmonizationEditComponent} from './components/harmonization-edit/harmonization-edit.component';

const routes: Routes = [
  {
    path: '',
    component: HarmonizationListComponent,
    pathMatch: 'full',
  },
  {
    path: 'new',
    component: HarmonizationEditComponent,
    data: {breadcrumb: 'New'},
  },
  {
    path: ':harmonizationId',
    component: HarmonizationEditComponent,
    data: {breadcrumb: 'Harmonization'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HarmonizationRoutingModule {
}

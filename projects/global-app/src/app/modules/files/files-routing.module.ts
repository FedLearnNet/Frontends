import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {FileListComponentComponent} from "./components/file-list-component/file-list-component.component";
import {FileDetailComponentComponent} from "./components/file-detail-component/file-detail-component.component";
import {filesStoreResolver, fileStoreResolver} from "./store/files.resolver";

const routes: Routes = [
  {
    path: '',
    children: [{
      path: '',
      component: FileListComponentComponent,
      pathMatch: 'full',
      resolve: {file: filesStoreResolver}
    },
      {
        path: ':file-id',
        component: FileDetailComponentComponent,
        pathMatch: 'full',
        resolve: {file: fileStoreResolver}
      },
    ],
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
export class FilesRoutingModule {
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DragAndDropFileComponent } from '@shared-lib/components/drag-and-drop-file/drag-and-drop-file.component';
import { DragAndDropDirective } from '@shared-lib/directives/drag-and-drop.directive';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BreadcrumbComponent } from '@shared-lib/components/breadcrumb/breadcrumb.component';
import { SpinnerComponent } from '@shared-lib/components/spinner/spinner.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorComponent } from '@shared-lib/components/mat-paginator/mat-paginator.component';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({ declarations: [
        ToolbarComponent,
        ConfirmDialogComponent,
        DragAndDropFileComponent,
        DragAndDropDirective,
        BreadcrumbComponent,
        SpinnerComponent,
        MatPaginatorComponent,
    ],
    exports: [
        ToolbarComponent,
        ConfirmDialogComponent,
        DragAndDropFileComponent,
        BreadcrumbComponent,
        SpinnerComponent,
        MatPaginatorComponent,
    ], imports: [CommonModule,
        RouterModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatPaginatorModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class SharedLibModule { }

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
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [
        ToolbarComponent,
        ConfirmDialogComponent,
        DragAndDropFileComponent,
        DragAndDropDirective,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        HttpClientModule,
    ],
    exports: [
        ToolbarComponent,
        ConfirmDialogComponent,
        DragAndDropFileComponent,
    ],
})
export class SharedLibModule { }

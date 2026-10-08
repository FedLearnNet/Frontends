import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

export type SkipTransformDialogResult = 'ADD' | 'SKIP';

@Component({
  selector: 'app-skip-transform-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './skip-transform-dialog.component.html',
  styleUrl: './skip-transform-dialog.component.scss',
})
export class SkipTransformDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<SkipTransformDialogComponent, SkipTransformDialogResult>>(MatDialogRef);

  addTransform(): void {
    this.dialogRef.close('ADD');
  }

  skip(): void {
    this.dialogRef.close('SKIP');
  }
}

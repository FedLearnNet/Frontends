import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

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
  private readonly dialogRef = inject<MatDialogRef<SkipTransformDialogComponent, boolean>>(MatDialogRef);

  addTransform(): void {
    this.dialogRef.close(true);
  }

  skip(): void {
    this.dialogRef.close(false);
  }
}

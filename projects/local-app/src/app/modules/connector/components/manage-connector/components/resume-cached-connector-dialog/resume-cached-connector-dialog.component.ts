import {Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-resume-cached-connector-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
  ],
  templateUrl: './resume-cached-connector-dialog.component.html',
  styleUrl: './resume-cached-connector-dialog.component.scss',
})
export class ResumeCachedConnectorDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ResumeCachedConnectorDialogComponent, boolean>>(MatDialogRef);

  continueFromDraft(): void {
    this.dialogRef.close(true);
  }

  startFresh(): void {
    this.dialogRef.close(false);
  }
}

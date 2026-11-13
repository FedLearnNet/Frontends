import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

export type UnsavedChangesDecision = 'save' | 'keep-editing' | 'discard';

@Component({
  selector: 'lib-unsaved-changes-dialog',
  imports: [MatDialogModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Unsaved changes</h2>
    <div mat-dialog-content>
      <p>You have unsaved changes. If you leave now, they will be lost.</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close('discard')">Discard changes</button>
      <button mat-button (click)="close('keep-editing')">Keep editing</button>
      <button mat-flat-button color="primary" (click)="close('save')" cdkFocusInitial>Save</button>
    </div>
  `,
})
export class UnsavedChangesDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<UnsavedChangesDialogComponent, UnsavedChangesDecision>>(MatDialogRef);

  close(decision: UnsavedChangesDecision): void {
    this.dialogRef.close(decision);
  }
}

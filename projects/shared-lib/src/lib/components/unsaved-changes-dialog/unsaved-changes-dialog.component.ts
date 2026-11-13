import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';

export type UnsavedChangesDecision = 'save' | 'keep-editing' | 'discard';

@Component({
  selector: 'lib-unsaved-changes-dialog',
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ 'UNSAVED_CHANGES.TITLE' | translate }}</h2>
    <div mat-dialog-content>
      <p>{{ 'UNSAVED_CHANGES.MESSAGE' | translate }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="close('discard')">{{ 'UNSAVED_CHANGES.DISCARD' | translate }}</button>
      <button mat-button (click)="close('keep-editing')">{{ 'UNSAVED_CHANGES.KEEP_EDITING' | translate }}</button>
      <button mat-flat-button color="primary" (click)="close('save')" cdkFocusInitial>{{ 'UNSAVED_CHANGES.SAVE' | translate }}</button>
    </div>
  `,
})
export class UnsavedChangesDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<UnsavedChangesDialogComponent, UnsavedChangesDecision>>(MatDialogRef);

  close(decision: UnsavedChangesDecision): void {
    this.dialogRef.close(decision);
  }
}

import {Component, inject} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';

export type ConnectorCreateChoice = 'create' | 'import';

@Component({
  selector: 'app-connector-create-choice-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MatDialogContent,
    MatDialogActions,
    MatIcon,
    TranslatePipe,
    BtnComponent,
  ],
  templateUrl: './connector-create-choice-dialog.component.html',
  styleUrl: './connector-create-choice-dialog.component.scss',
})
export class ConnectorCreateChoiceDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConnectorCreateChoiceDialogComponent, ConnectorCreateChoice | undefined>);

  choose(choice: ConnectorCreateChoice): void {
    this.dialogRef.close(choice);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

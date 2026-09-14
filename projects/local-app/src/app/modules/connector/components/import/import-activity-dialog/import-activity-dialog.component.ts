import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent} from '@angular/material/dialog';
import {CloseableDialogTitleComponent} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {Store} from '@ngrx/store';
import {selectImport} from '../../../store/import/import.selectors';
import {ImportActivityComponent} from '../import-activity/import-activity.component';

export interface ImportActivityDialogData {
  importId: string;
}


@Component({
  selector: 'app-import-activity-dialog',
  imports: [MatDialogContent, CloseableDialogTitleComponent, ImportActivityComponent],
  templateUrl: './import-activity-dialog.component.html',
  styleUrl: './import-activity-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportActivityDialogComponent {

  private readonly store = inject(Store);
  private readonly data = inject<ImportActivityDialogData>(MAT_DIALOG_DATA);

  readonly activity = this.store.selectSignal(selectImport(this.data.importId));
}

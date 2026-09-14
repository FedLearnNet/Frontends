import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {TranslatePipe} from '@ngx-translate/core';
import {ImportActivity, isImportFinished} from '../../../dto/import-progress';
import {ImportActivityDialogComponent} from '../import-activity-dialog/import-activity-dialog.component';


@Component({
  selector: 'app-import-activity-chip',
  imports: [MatIcon, MatProgressBarModule, TranslatePipe],
  templateUrl: './import-activity-chip.component.html',
  styleUrl: './import-activity-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportActivityChipComponent {

  private readonly dialog = inject(MatDialog);

  readonly activity = input.required<ImportActivity>();

  readonly finished = computed(() => isImportFinished(this.activity().phase));
  readonly succeeded = computed(() => this.activity().phase === 'SUCCEEDED');
  readonly failed = computed(() =>
    this.activity().phase === 'FAILED' || this.activity().phase === 'REFUSED');

  readonly icon = computed(() => {
    if (this.succeeded()) {
      return 'check_circle';
    }
    return this.failed() ? 'error' : 'sync';
  });

  readonly percent = computed(() =>
    this.activity().phase === 'TRANSFER' ? this.activity().transferPercent : undefined);

  open(): void {
    this.dialog.open(ImportActivityDialogComponent, {
      autoFocus: false,
      data: {importId: this.activity().importId},
    });
  }
}

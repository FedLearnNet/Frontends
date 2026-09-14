import {Component, computed, inject, signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

export interface CohortCustomStatisticsDashboardDialogData {
  mode: 'CREATE' | 'RENAME';
  initialName?: string;
}

export type CohortCustomStatisticsDashboardDialogResult = string | undefined;

@Component({
  selector: 'app-cohort-custom-statistics-dashboard-dialog',
  imports: [
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    CloseableDialogTitleComponent,
    BtnComponent,
  ],
  templateUrl: './cohort-custom-statistics-dashboard-dialog.component.html',
  styleUrl: './cohort-custom-statistics-dashboard-dialog.component.scss',
})
export class CohortCustomStatisticsDashboardDialogComponent {
  private readonly dialogRef: MatDialogRef<
    CohortCustomStatisticsDashboardDialogComponent,
    CohortCustomStatisticsDashboardDialogResult
  > = inject(MatDialogRef);

  readonly data = inject<CohortCustomStatisticsDashboardDialogData>(MAT_DIALOG_DATA);

  readonly name = signal<string>(this.data.initialName ?? '');
  readonly title = computed(() => this.data.mode === 'RENAME' ? 'Rename dashboard' : 'New dashboard');
  readonly submitType = computed<'CREATE' | 'SAVE'>(() => this.data.mode === 'RENAME' ? 'SAVE' : 'CREATE');
  readonly canSubmit = computed(() => this.name().trim().length > 0);

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.dialogRef.close(this.name().trim());
  }
}

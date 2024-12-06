import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {FormBuilder} from "@angular/forms";
import {ModelDetailDto, ModelVersionDto} from "@global-app/model-store/dto/model";


@Component({
  selector: 'app-prediction-new',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, SharedLibModule],
  templateUrl: './prediction-new.component.html',
  styleUrl: './prediction-new.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictionNewComponent {
  private readonly dialogRef: MatDialogRef<PredictionNewComponent> = inject(MatDialogRef);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  readonly model = inject<ModelDetailDto>(MAT_DIALOG_DATA);


  filesForm = this.formBuilder.group({
    files: [[]],
  });


  filesChanged(event: any): void {
    this.filesForm.patchValue({files: event});
  }

  onPredict(): void {
    if (!this.hasInputFiles()) return;
    this.dialogRef.close();
  }

  hasInputFiles(): boolean {
    const files = this.filesForm.getRawValue()?.files ?? [];

    return files.length !== 0;
  }

}

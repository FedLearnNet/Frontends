import {Component, inject} from '@angular/core';
import {Store} from "@ngrx/store";
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {CreateModelWorkflowDTO} from "@shared-lib/modules/app-execution/dto/model-workflow";
import {TranslatePipe} from "@ngx-translate/core";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";

@Component({
  selector: 'lib-create-model-workflow-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogClose,
    TranslatePipe,
    ReactiveFormsModule,
  ],
  templateUrl: './create-model-workflow-dialog.component.html',
  styleUrl: './create-model-workflow-dialog.component.scss'
})
export class CreateModelWorkflowDialogComponent {
  private readonly store: Store = inject(Store);
  private readonly dialogRef: MatDialogRef<CreateModelWorkflowDialogComponent> = inject(MatDialogRef);

  newExperimentForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
  });

  close(): void {
    this.dialogRef.close();
  }

  create(): void {
    if (this.newExperimentForm.invalid) {
      return;
    }
    const workflow: CreateModelWorkflowDTO = {
      name: this.newExperimentForm.value.name!,
    }
    this.store.dispatch(DataAnalysisActions.createDataAnalysis({
      workflow: workflow
    }));
    this.close();
  }
}

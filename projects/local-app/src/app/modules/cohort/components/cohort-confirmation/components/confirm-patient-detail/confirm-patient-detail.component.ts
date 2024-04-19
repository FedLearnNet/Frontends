import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SelectOption } from '@shared-lib/models';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-confirm-patient-detail',
  templateUrl: './confirm-patient-detail.component.html',
  styleUrl: './confirm-patient-detail.component.scss',
})
export class ConfirmPatientDetailComponent {
  colorectalCancerOptions: SelectOption[];

  patientDetailForm = this.formBuilder.nonNullable.group({
    id: [null],
    age: [null],
    files: [[]],
    dietaryScore: [null],
    colorectalCancer: [null],
  });

  constructor(
      public dialogRef: MatDialogRef<ConfirmPatientDetailComponent>,

      @Inject(MAT_DIALOG_DATA) public data: any,

      private cohortService: CohortService,
      private formBuilder: FormBuilder,
  ) {  }

  ngOnInit() {
    this.loadColorectalCancerOptions();

    this.patientDetailForm.patchValue(this.data.patientData)
    this.patientDetailForm.disable();
  }

  loadColorectalCancerOptions(): void {
    this.cohortService.getColorectalCancerOptions()
        .subscribe(colorectalCancerOptions => this.colorectalCancerOptions = colorectalCancerOptions);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

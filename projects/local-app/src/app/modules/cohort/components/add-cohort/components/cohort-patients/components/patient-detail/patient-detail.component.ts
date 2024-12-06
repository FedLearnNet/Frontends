import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { SelectOption } from '@shared-lib/models';
import { CohortService } from '@local-app/cohort/services/cohort.service';
import { cloneDeep } from 'lodash';
import { generateRandomUUID } from '@shared-lib/utils';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss',
})
export class PatientDetailComponent implements OnInit {
  public patientData: FormGroup;
  colorectalCancerOptions: SelectOption[];
  queriabilityOptions: SelectOption[];

  constructor(
      private cohortService: CohortService,

      public dialogRef: MatDialogRef<PatientDetailComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
  ) {  }

  ngOnInit() {
    this.patientData = cloneDeep(this.data.patientData);

    this.loadPatientId();
    this.loadColorectalCancerOptions();
    this.loadQueriabilityOptions();
  }

  getDialogTitle(): string {
    return `${this.isEdit() ? 'Update' : 'Add'} patient`
  }

  getSubmitButtonLabel(): string {
    return `${this.isEdit() ? 'Update' : 'Add'} this patient`;
  }

  isEdit(): boolean {
    return this.patientData.value.id !== null
        && this.patientData.value.patientId !== null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    if (!this.isPatientFormValid()) return;

    this.dialogRef.close(this.patientData.getRawValue());
  }

  filesChanged($event: any) {
    this.patientData.patchValue({
      files: $event,
    });
  }

  loadColorectalCancerOptions(): void {
    this.cohortService.getColorectalCancerOptions()
        .subscribe(colorectalCancerOptions => this.colorectalCancerOptions = colorectalCancerOptions);
  }

  loadQueriabilityOptions(): void {
    this.cohortService.getQueriabilityOptions()
        .subscribe(queriabilityOptions => this.queriabilityOptions = queriabilityOptions);
  }

  isPatientFormValid(): boolean {
    this.patientData.markAllAsTouched();

    return this.patientData.valid;
  }

  loadPatientId(): void {
    const patientIdFormControl = this.patientData.get('patientId');

    if (patientIdFormControl?.value) {
      return;
    }

    patientIdFormControl?.setValue(generateRandomUUID());
  }
}

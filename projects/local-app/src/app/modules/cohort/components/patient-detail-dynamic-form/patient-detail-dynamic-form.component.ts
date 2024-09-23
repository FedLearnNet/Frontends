import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { cloneDeep } from 'lodash';
import { snakeToCamel } from '@shared-lib/utils';
import { isEmpty } from 'lodash';
import { DynamicFormComponent } from '@local-app/cohort/components/dynamic-form/dynamic-form.component';
import { SchemaDataService } from '@local-app/cohort/services/schema-data.service';
import { SchemaFieldStructure } from '@shared-lib/models';

@Component({
  selector: 'app-patient-detail-dynamic-form',
  templateUrl: './patient-detail-dynamic-form.component.html',
  styleUrl: './patient-detail-dynamic-form.component.scss',
})
export class PatientDetailDynamicFormComponent implements OnInit {
  validationErrors: any;
  public schemaData: any;
  public schemaDynamicFormConfig: SchemaFieldStructure[];

  @ViewChild('dynamicForm') dynamicForm: DynamicFormComponent;

  constructor(
      public dialogRef: MatDialogRef<PatientDetailDynamicFormComponent>,

      private schemaDataService: SchemaDataService,

      @Inject(MAT_DIALOG_DATA) public data: any,
  ) {  }

  ngOnInit(): void {
    this.schemaData = cloneDeep(this.data.schemaData);
    this.schemaDynamicFormConfig = this.prepareDynamicFormConfig();
  }

  prepareDynamicFormConfig(): SchemaFieldStructure[] {
    const formConfig = cloneDeep(this.data.schemaDynamicFormConfig);

    if (isEmpty(this.schemaData)) {
      return  formConfig;
    }

    return this.getMergedFormDataWithPatientData(formConfig);
  }

  getDialogTitle(): string {
    return `${this.isEdit() ? 'Update' : 'Add'} patient`
  }

  getSubmitButtonLabel(): string {
    return `${this.isEdit() ? 'Update' : 'Add'} this patient`;
  }

  isEdit(): boolean {
    return this.schemaData && this.schemaData.id !== null
        && this.schemaData.patientId !== null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const formData = this.dynamicForm.submitForm();

    if (!formData) return;

    if (this.isEdit()) {
      this.updateSchemaData(formData);

      return;
    }

    this.submitSchemaData(formData);
  }

  getMergedFormDataWithPatientData(formConfig: SchemaFieldStructure[]): SchemaFieldStructure[] {
    return formConfig.map(field => {
      const schemaDataValue = this.schemaData[snakeToCamel(field.name)] ?? null;

      if (schemaDataValue) {
        field.value = schemaDataValue;
      }

      return field;
    });
  }

  private submitSchemaData(formData: FormGroup): void {
    this.schemaDataService.submitSchemaData(this.data.schemaUniqueId, formData.value).subscribe(response => {
      this.dialogRef.close(response);
    }, error => {
      this.validationErrors = cloneDeep(error?.error ?? {});
    });
  }

  private updateSchemaData(formData: FormGroup): void {
    this.schemaDataService.updateSchemaData(this.data.schemaUniqueId, this.data.schemaData.id, formData.value).subscribe(response => {
      this.dialogRef.close(response);
    }, error => {
      this.validationErrors = cloneDeep(error?.error ?? {});
    });
  }
}

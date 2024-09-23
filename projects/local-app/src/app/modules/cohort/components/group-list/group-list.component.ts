import { Component, Input, OnInit } from '@angular/core';
import { DynamicFormService } from '@local-app/cohort/services/dynamic-form.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { cloneDeep, isUndefined } from 'lodash';
import { SchemaFieldStructure } from '@shared-lib/models';
import {getSchemaFormName} from "@shared-lib/utils";

@Component({
  selector: 'app-local-app-group-list',
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent implements OnInit {
  editRowIndex: number | null;

  formGroup: FormGroup;
  baseFormGroup: FormGroup;
  dataSource: any[];
  displayedColumns: string[] = [];

  @Input() groupName: string;
  @Input() groupListData: any;
  @Input() formComponents: SchemaFieldStructure[] | undefined;

  constructor(
      private formBuilder: FormBuilder,
      private dynamicFormService: DynamicFormService,
  ) {}

  get items() {
      return this.formGroup.controls['items'] as FormArray;
  }

  ngOnInit(): void {
    this.initTable();
  }

  initTable(): void {
    this.formComponents?.forEach(formComponent => {
      this.displayedColumns.push(formComponent.label);
    });

    this.displayedColumns.push('actions');

    this.loadTableData();
  }

  loadTableData() {
      this.formGroup = this.formBuilder.group({
          items: this.formBuilder.array([]),
      });

      this.baseFormGroup = this.dynamicFormService.getFormGroup(this.formComponents);

      if (this.groupListData) {
        this.groupListData.forEach((listData: any) => {
          this.baseFormGroup.patchValue(listData)
          this.items.push(cloneDeep(this.baseFormGroup));
        });

        this.dataSource = cloneDeep(this.items.controls);
        this.baseFormGroup.reset();
      }
  }

  onAddNewRow(): void {
    if (this.isFirstRowInvalid()) {
      return;
    }

    this.items.insert(0, cloneDeep(this.baseFormGroup));
    this.dataSource = cloneDeep(this.items.controls);
    this.onEdit(0);
  }

  isRowInEditMode(index: number): boolean {
    return this.editRowIndex === index;
  }

  onSubmitRow(index: number): void {
    const submittedFormGroup = this.getFormGroup(index);

    if (submittedFormGroup.invalid) {
      return;
    }

    this.dataSource = cloneDeep(this.items.controls);
    this.onCancel();
  }

  onCancel(index: number | null = null): void {
    if (index === 0) {
      this.onRemove(index);
    }

    this.editRowIndex = null;
  }

  onEdit(index: number): void {
    this.editRowIndex = index;
  }

  onRemove(index: number): void {
    this.items.removeAt(index);
    this.dataSource = cloneDeep(this.items.controls);
  }

  getElementLabel(formGroup: FormGroup, formComponentName: string): string {
    return formGroup.getRawValue()[formComponentName] ?? '';
  }

  getErrorMessage(name: string): string {
    const formElement = this.formGroup.get(name);

    if (!formElement || formElement.untouched || !formElement.invalid) {
      return '';
    }

    const firstErrorKey = formElement.errors ? Object.keys(formElement.errors)[0] : null;
    if (firstErrorKey && this.formComponents) {
        const validators = this.formComponents.find(formComponent => formComponent.name === name)?.validations ?? [];

        return validators.find(validator => validator.name === firstErrorKey)?.message ?? 'Invalid field!';
    }

    return '';
  }

  getFormGroup(index: number): FormGroup {
    return this.items.controls.at(index) as FormGroup;
  }

  submitGroupListForm(): FormArray {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return this.formBuilder.array([]);
    }

    return this.formGroup.get('items') as FormArray;
  }

  private isFirstRowInvalid(): boolean {
    if (isUndefined(this.editRowIndex) || this.editRowIndex !== 0) {
      return false;
    }

    return this.getFormGroup(this.editRowIndex).invalid;
  }

  protected readonly getSchemaFormName = getSchemaFormName;
}

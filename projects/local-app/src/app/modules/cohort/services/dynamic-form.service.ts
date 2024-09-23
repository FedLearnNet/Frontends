import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, FormControl, FormArray } from '@angular/forms';
import { SchemaValidator } from '@local-app/cohort/models';
import { isEmpty } from 'lodash';
import { isNotEmpty } from '@shared-lib/utils';
import { SchemaFieldStructure, SelectOption } from '@shared-lib/models';

@Injectable({
    providedIn: 'root'
})
export class DynamicFormService {
    constructor(
        private formBuilder: FormBuilder,
    ) { }

    getDynamicFormConfig(dynamicFormFields: SchemaFieldStructure[] | undefined): SchemaFieldStructure[] {
        if (!dynamicFormFields) return [] as SchemaFieldStructure[];

        return dynamicFormFields.map(dynamicFormField => {
            if (isNotEmpty(dynamicFormField.fields)) {
                dynamicFormField.fields = this.getDynamicFormConfig(dynamicFormField.fields);
            }

            if (dynamicFormField.formType === 'radio' && dynamicFormField.dataType === 'boolean' && isEmpty(dynamicFormField.options)) {
                dynamicFormField.options = [
                    { label: 'True', value: true } as SelectOption,
                    { label: 'False', value: false } as SelectOption,
                ];
            }

            return dynamicFormField;
        });
    }

    getFormGroup(formStructure: SchemaFieldStructure[] | undefined): FormGroup {
        const dynamicFormGroup = this.formBuilder.group({});

        if (!formStructure) return dynamicFormGroup;

        formStructure.forEach(formElement => {
            if (formElement.nodeType === 'group' && formElement.fields) {
                dynamicFormGroup.addControl(
                    formElement.name,
                    this.getFormGroup(formElement.fields),
                );

                return;
            } else if (formElement.nodeType === 'group_list' && formElement.fields) {
                dynamicFormGroup.addControl(
                    formElement.name,
                    new FormArray([this.getFormGroup(formElement.fields)]),
                );

                return;
            }

            dynamicFormGroup.addControl(
                formElement.name,
                new FormControl(
                    {
                        value: formElement.value,
                        disabled: formElement.readonly ?? false,
                    },
                    {
                        validators: this.getValidators(formElement.validations)
                    },
                ),
            );
        });

        return dynamicFormGroup;
    }

    private getValidators(validators: SchemaValidator[] | undefined): ValidatorFn[] {
        if (isEmpty(validators) || !validators) return [] as ValidatorFn[];

        const specificValidators: ValidatorFn[] = [];

        if (DynamicFormService.needsRequiredValidator(validators)) {
            specificValidators.push(Validators.required);
        }

        validators.forEach(validator => {
            specificValidators.push(
                this.getValidator(validator),
            )
        });

        return specificValidators;
    }

    private static needsRequiredValidator(validators: SchemaValidator[]): boolean {
        return !validators.some(validation => validation.name === 'required');
    }

    private getValidator(validator: SchemaValidator): ValidatorFn {
        switch (validator.name) {
            case 'required':
                return Validators.required;
            case 'min':
                return Validators.min(parseInt(validator.validator));
            case 'max':
                return Validators.max(parseInt(validator.validator));
            default:
                return Validators.required;
        }
    }
}

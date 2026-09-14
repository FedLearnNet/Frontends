import {inject, Injectable} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {isEmpty} from 'lodash';
import {isNotEmpty} from '@shared-lib/utils';
import {TranslateService} from '@ngx-translate/core';
import {SchemaNodeNestedDto, SchemaNodeTypeEnum} from "@local-app/cohort/dto/schema";
import {
  DatatypeFormTypeEnum,
  DataTypeOptionsDto,
  DataTypeTypeEnum,
  DataTypeValidationDto,
  DataTypeValidationNameEnum
} from "@local-app/cohort/dto/data-type";

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly translate: TranslateService = inject(TranslateService);

  isNodeGroup(node: SchemaNodeNestedDto) {
    if (node.nodeType === SchemaNodeTypeEnum.GROUP) {
      return true;
    }
    if ((node.childNodes ?? []).length > 0) {
      return true;
    }
    return !(node.ontology && node.dataType)
  }

  getId(node: SchemaNodeNestedDto): string {
    return node.id ? ("" + node.id) : node.globalId;
  }

  getDynamicFormConfig(nodes: SchemaNodeNestedDto[] | undefined): SchemaNodeNestedDto[] {
    if (!nodes) return [] as SchemaNodeNestedDto[];

    return nodes.map(node => {
      if (this.isNodeGroup(node)) {
        if (isNotEmpty(node.childNodes)) {
          node.childNodes = this.getDynamicFormConfig(node.childNodes);
        }
        return node;
      }

      if (node.dataType.formType === DatatypeFormTypeEnum.RADIO &&
        node.dataType.type === DataTypeTypeEnum.BOOLEAN &&
        isEmpty(node.dataType.options)) {
        node.dataType.options = [
          {label: this.translate.instant('BUTTON.TRUE'), value: true} as DataTypeOptionsDto,
          {label: this.translate.instant('BUTTON.FALSE'), value: false} as DataTypeOptionsDto,
        ];
      }

      return node;
    });
  }

  getFormGroup(schemaNodes: SchemaNodeNestedDto[]): FormGroup {
    const dynamicFormGroup = this.formBuilder.group({});

    if (!schemaNodes) return dynamicFormGroup;
    schemaNodes.forEach(node => {
      const id = node.id ? ("" + node.id) : node.globalId;
      const dataType = node.dataType;
      if (node.nodeType === SchemaNodeTypeEnum.GROUP && node.childNodes) {
        dynamicFormGroup.addControl(
          id,
          this.getFormGroup(node.childNodes),
        );
        return;
      }
      const readonly = dataType.isReadonly ?? false;
      // attribute nodes
      dynamicFormGroup.addControl(
        id,
        new FormControl(
          {
            value: dataType.value ?? '',
            disabled: readonly,
          },
          {
            validators: this.getValidators(dataType.validations, dataType.isRequired)
          },
        ),
      );
    });

    return dynamicFormGroup;
  }

  private getValidators(validators: DataTypeValidationDto[] | undefined, isRequired?: boolean): ValidatorFn[] {
    const specificValidators: ValidatorFn[] = [];

    if (isRequired) {
      specificValidators.push(Validators.required);
    }

    if (isEmpty(validators) || !validators) {
      return specificValidators;
    }

    validators.forEach(validator => {
      specificValidators.push(this.getValidator(validator));
    });

    return specificValidators;
  }


  private getValidator(validator: DataTypeValidationDto): ValidatorFn {
    if (!validator.validator) {
      return Validators.required;
    }
    switch (validator.name) {
      case DataTypeValidationNameEnum.MIN:
        return Validators.min(parseInt(validator.validator));
      case DataTypeValidationNameEnum.MAX:
        return Validators.max(parseInt(validator.validator));
      case DataTypeValidationNameEnum.MINLENGTH:
        return Validators.minLength(parseInt(validator.validator));
      case DataTypeValidationNameEnum.MAXLENGTH:
        return Validators.maxLength(parseInt(validator.validator));
      default:
        return Validators.required;
    }
  }
}

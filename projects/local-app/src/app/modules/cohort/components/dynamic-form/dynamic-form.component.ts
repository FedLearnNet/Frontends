import {Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatExpansionPanel} from '@angular/material/expansion';
import _, {isEmpty, isObject} from 'lodash';
import {BooleanInput} from '@angular/cdk/coercion';
import {DynamicFormService} from '@local-app/cohort/services/dynamic-form.service';
import {getSchemaFormName, isNotEmpty} from '@shared-lib/utils';
import {GroupListComponent} from '@local-app/cohort/components/group-list/group-list.component';
import {SchemaFieldStructure} from '@shared-lib/models';

@Component({
  selector: 'app-local-app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit, OnChanges {
  dynamicForm: FormGroup;

  @Input() errors: any;
  @Input() schemaData: any;
  @Input() nestedFormName: string | undefined;
  @Input() parentComponent: DynamicFormComponent | undefined;
  @Input() dynamicFormComponents: SchemaFieldStructure[] | undefined;

  @ViewChildren('groupListComponent') groupListComponents: QueryList<GroupListComponent>;
  @ViewChildren(DynamicFormComponent) childForms: QueryList<DynamicFormComponent>;
  @ViewChildren('matExpansionPanelElement') matExpansionPanelElements: QueryList<MatExpansionPanel>;

  constructor(
    private formBuilder: FormBuilder,
    private dynamicFormService: DynamicFormService,
  ) {
  }


  ngOnInit(): void {
    this.dynamicForm = this.dynamicFormService.getFormGroup(this.dynamicFormComponents);

    if (this.schemaData) {
      //TODO FUSH REMOVE
      if (this.nestedFormName) {
        const snake = _.transform(this.schemaData, (acc: any, value: string, key: string, target: any) => {
          const camelKey = _.isArray(target) ? key : _.snakeCase(key);

          acc[camelKey] = value;
        });
        this.dynamicForm.patchValue(snake);
      } else {
        this.dynamicForm.patchValue(this.schemaData);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['errors']?.currentValue && isNotEmpty(changes['errors'].currentValue)) {
      this.handleErrors();
    }
  }

  submitForm(): FormGroup | undefined {
    const formData = DynamicFormComponent.mergeFormGroups([
      this.getDynamicFormData(),
      this.collectNestedFormValues(this.childForms.toArray()),
    ]);

    if (formData.invalid) {
      return;
    }

    return formData;
  }

  getErrorMessage(name: string): string {
    const formElement = this.dynamicForm.get(name);

    if (!formElement || formElement.untouched || !formElement.invalid) {
      return '';
    }

    return this.getSpecificErrorMessage(name, formElement.errors);
  }

  private getSpecificErrorMessage(name: string, errors: any): string {
    if (!this.dynamicFormComponents) return '';

    const formComponent = this.dynamicFormComponents.find(formComponent => formComponent.name === name);
    const validations = formComponent?.validations ?? [];

    if (!formComponent || isEmpty(validations) && isEmpty(errors)) return 'Invalid field!';

    const validation = validations.find(validation => validation.name === Object.keys(errors)[0]);

    if (errors.error) {
      return errors.error;
    }

    if (!validation) return 'Invalid field!';

    return validation.message;
  }

  isChecked(checked: string | number | boolean | undefined): BooleanInput {
    return checked as BooleanInput;
  }

  getErrors(formComponentName: string): any {
    if (isEmpty(this.errors)) return {};

    return this.errors[formComponentName];
  }

  getSchemaData(componentName: string) {
    if (isEmpty(this.schemaData)) {
      return;
    }

    const data = this.schemaData[componentName] ?? null;
    if (data) {
      return data;
    }
    return this.schemaData[_.camelCase(componentName)] ?? null;
  }

  private getDynamicFormData(): FormGroup {
    this.dynamicForm.markAllAsTouched();

    this.checkGroupLists();

    return this.dynamicForm;
  }

  private checkGroupLists(): void {
    if (!this.dynamicFormComponents) {
      return;
    }

    const groupListElements = this.dynamicFormComponents
      .filter(dynamicFormComponent => dynamicFormComponent.nodeType === 'group_list');

    if (isEmpty(groupListElements)) {
      return;
    }

    groupListElements.forEach(groupListElement => {
      const groupListComponent = this.groupListComponents.find(groupListComponent => groupListComponent.groupName === groupListElement.name);

      if (groupListComponent instanceof GroupListComponent) {
        this.dynamicForm.controls[groupListElement.name] = groupListComponent?.submitGroupListForm();
      }
    });
  }

  private collectNestedFormValues(forms: DynamicFormComponent[]): FormGroup {
    const formGroup = this.formBuilder.group({});

    forms.forEach(childForm => {
      const childFormData = childForm.getDynamicFormData();
      const collectedFormData = this.collectNestedFormValues(childForm.childForms.toArray())

      this.checkForError(childForm);

      if (childForm.nestedFormName != null && childFormData) {
        formGroup.addControl(
          childForm.nestedFormName,
          DynamicFormComponent.mergeFormGroups([
            childForm.getDynamicFormData() as FormGroup,
            collectedFormData,
          ]),
        );
      }
    });

    return formGroup;
  }

  private static mergeFormGroups(formGroups: FormGroup[]): FormGroup {
    const mergedControls = formGroups.reduce((merged, formGroup) => {
      return {...merged, ...formGroup.controls};
    }, {});

    return new FormGroup(mergedControls);
  }

  private checkForError(dynamicFormComponent: DynamicFormComponent): void {
    if (dynamicFormComponent.dynamicForm.invalid && dynamicFormComponent.parentComponent?.matExpansionPanelElements) {
      this.openExpansionPanel(dynamicFormComponent, dynamicFormComponent.nestedFormName);
    }
  }

  private handleErrors(errors: any = this.errors, formControlPath: string = ''): void {
    Object.entries(errors).forEach(([key, value]) => {
      if (isObject(value)) {
        this.handleErrors(value, DynamicFormComponent.getFormControlPath(formControlPath, key));
      } else {
        this.dynamicForm.get(formControlPath)?.setErrors({error: value});

        this.openExpansionPanel(this, this.nestedFormName);
      }
    });
  }

  private static getFormControlPath(formControlPath: string, key: string): string {
    if (isEmpty(formControlPath)) {
      return key;
    }

    return `${formControlPath}.${key}`;
  }

  private openExpansionPanel(dynamicFormComponent: DynamicFormComponent, nestedFormName: string = ''): void {
    const lastChildOfExpansion: any = document.querySelector(`[expansion-name='${nestedFormName}']`)?.lastChild;
    if (lastChildOfExpansion) {

      const matchingPanel = dynamicFormComponent.parentComponent?.matExpansionPanelElements.find(panel => panel.id === lastChildOfExpansion.id);
      if (matchingPanel) {
        matchingPanel.open();
      }
    }
  }

  protected readonly getSchemaFormName = getSchemaFormName;
}

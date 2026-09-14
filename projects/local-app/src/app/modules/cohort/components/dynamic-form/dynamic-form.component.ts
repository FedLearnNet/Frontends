import {Component, effect, forwardRef, inject, input, QueryList, ViewChildren} from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import {MatExpansionModule, MatExpansionPanel} from '@angular/material/expansion';
import {DynamicFormService} from '@local-app/cohort/services/dynamic-form.service';
import {SchemaNodeNestedDto} from "@local-app/cohort/dto/schema";
import {
  PatientDataFormFieldComponent
} from "../../../patient/components/patient-data-form-field/patient-data-form-field.component";
import {toLocalFormDateTimeString} from "../../../patient/helper/patient-data-parser-helper";

@Component({
  selector: 'app-local-app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
  imports: [
    MatExpansionModule,
    ReactiveFormsModule,
    PatientDataFormFieldComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicFormComponent),
      multi: true
    }
  ],
})
export class DynamicFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dfs = inject(DynamicFormService);

  cohortData = input<any>(null);
  childFormGroup = input<FormGroup | null | any>(null);
  nestedFormName = input<string | undefined>(undefined);
  parentComponent = input<DynamicFormComponent | undefined>(undefined);
  schemaNodes = input<SchemaNodeNestedDto[] | undefined>(undefined);

  @ViewChildren(DynamicFormComponent) childForms!: QueryList<DynamicFormComponent>;
  @ViewChildren('matExpansionPanelElement') matExpansionPanelElements!: QueryList<MatExpansionPanel>;
  @ViewChildren(PatientDataFormFieldComponent) formFields!: QueryList<PatientDataFormFieldComponent>;

  dynamicForm: FormGroup = this.fb.group({});

  private _buildForm = effect(() => {
    const comps = this.schemaNodes();
    if (!comps) {
      return;
    }
    const externalChild = this.childFormGroup();

    this.dynamicForm = externalChild
      ? externalChild
      : this.dfs.getFormGroup(comps);

    const cd = this.cohortData();
    if (cd?.dataEntries) {
      this.dynamicForm.get('externalPatientId')?.setValue(cd.externalPatientId);
      this.dynamicForm.get('externalPatientId')?.disable();
      this.patchFormValuesFromDataEntries(this.dynamicForm, cd.dataEntries);
    }
  });

  isGroup(node: SchemaNodeNestedDto) {
    return this.dfs.isNodeGroup(node);
  }

  getId(node: SchemaNodeNestedDto): string {
    return this.dfs.getId(node);
  }

  submitForm(): FormGroup | undefined {
    const formData = DynamicFormComponent.mergeFormGroups([
      this.getDynamicFormData(),
      this.collectNestedFormValues(this.childForms?.toArray() ?? [])
    ]);
    if (formData.valid) {
      return formData;
    } else {
      formData.markAllAsTouched();
      this.markAllChildControlsAsTouched(formData);
      this.logValidationErrors(formData);
    }
    return undefined;
  }

  private markAllChildControlsAsTouched(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control instanceof FormGroup) {
        this.markAllChildControlsAsTouched(control);
      } else if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    });
  }

  private logValidationErrors(form: FormGroup, parentKey: string = '') {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      const controlPath = parentKey ? `${parentKey}.${key}` : key;

      if (control instanceof FormGroup) {
        // recurse into children
        this.logValidationErrors(control, controlPath);
      } else {
        if (control && control.errors) {
          const readablePath = this.resolvePathNames(controlPath, this.schemaNodes() ?? []);
          console.error(`❌ Errors in [${readablePath}]`, control.errors);
        }
      }
    });
  }

  private resolvePathNames(path: string, schemaNodes: SchemaNodeNestedDto[]): string {
    const parts = path.split('.');
    const resolvedNames: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      const currentId = parts.slice(0, i + 1).join('.');
      const node = this.findNodeById(currentId, schemaNodes);
      resolvedNames.push(node?.name ?? parts[i]);
    }

    return resolvedNames.join(' > ');
  }

  private findNodeById(id: string, schemaNodes: SchemaNodeNestedDto[]): SchemaNodeNestedDto | undefined {
    for (const node of schemaNodes) {
      if (node.id === +id) return node;
      const child = this.findNodeById(id, node.childNodes ?? []);
      if (child) return child;
    }
    return undefined;
  }

  private getDynamicFormData(): FormGroup {
    this.dynamicForm.markAllAsTouched();
    return this.dynamicForm;
  }

  private collectNestedFormValues(forms: DynamicFormComponent[]): FormGroup {
    const group = this.fb.group({});
    for (const child of forms) {
      const childFormData = child.getDynamicFormData();
      const nested = this.collectNestedFormValues(child.childForms?.toArray() ?? []);
      this.checkForError(child);

      if (child.nestedFormName() && childFormData) {
        group.addControl(
          child.nestedFormName()!,
          DynamicFormComponent.mergeFormGroups([child.getDynamicFormData() as FormGroup, nested])
        );
      }
    }
    return group;
  }

  private static mergeFormGroups(formGroups: FormGroup[]): FormGroup {
    const mergedControls = formGroups.reduce((merged, fg) => ({...merged, ...fg.controls}), {});
    return new FormGroup(mergedControls);
  }

  private checkForError(cmp: DynamicFormComponent): void {
    if (cmp.dynamicForm.invalid && cmp.parentComponent()?.matExpansionPanelElements) {
      this.openExpansionPanel(cmp.nestedFormName());
    }
  }

  private openExpansionPanel(nestedFormName: string | undefined): void {
    if (!nestedFormName) return;
    const lastChildOfExpansion: any = document.querySelector(`[expansion-name='${nestedFormName}']`)?.lastChild;
    if (!lastChildOfExpansion) return;

    const matchingPanel = this.matExpansionPanelElements.find(
        panel => (panel as any)._elementRef.nativeElement.getAttribute('data-expansion-id') === nestedFormName
    );

    matchingPanel?.open();
  }

  private patchFormValuesFromDataEntries(formGroup: FormGroup, dataEntries: any[]) {
    const entryMap = new Map<number, any>();
    for (const entry of dataEntries) entryMap.set(entry.schemaNodeId, entry.value);

    const patchControls = (group: FormGroup) => {
      Object.keys(group.controls).forEach(key => {
        const control = group.get(key);
        if (control instanceof FormGroup) {
          patchControls(control);
          return;
        }

        const nodeId = Number(key);
        const value = entryMap.get(nodeId);

        if (value === undefined) return;

        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
          const timeStr = toLocalFormDateTimeString(value)
          control?.setValue(timeStr);
        } else {
          control?.setValue(value);
        }
      });
    };

    patchControls(formGroup);
  }
}

import {AfterViewInit, Component, computed, effect, inject, input, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatCheckboxModule} from '@angular/material/checkbox';

import {SchemaNodeNestedDto} from '@local-app/cohort/dto/schema';
import {getSchemaFormName} from '@shared-lib/utils';
import { DragAndDropFileComponent } from '@shared-lib/components/drag-and-drop-file/drag-and-drop-file.component';

@Component({
  selector: 'app-patient-data-form-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    DragAndDropFileComponent
  ],
  templateUrl: './patient-data-form-field.component.html',
  styleUrl: './patient-data-form-field.component.scss',
  host: {
    '[attr.data-patient-field-anchor]': 'node().id',
  },
})
export class PatientDataFormFieldComponent implements AfterViewInit {
  private readonly translate = inject(TranslateService);

  node = input.required<SchemaNodeNestedDto>();
  control = input<AbstractControl | null | undefined>(null);

  value = signal<any>(null);
  errorMessage = signal<string | undefined>(undefined);

  formType = computed(
    () => this.node().dataType.formType?.toLowerCase?.() ?? 'text'
  );

  label = computed(
    () => getSchemaFormName(this.node().name, this.node().dataType.name)
  );

  constructor() {
    effect(() => this.updateErrorMessage());
  }

  get formControl(): FormControl {
    return this.control() as FormControl;
  }

  ngAfterViewInit(): void {
    const control = this.control();
    if (!control) return;

    this.value.set(control.value);

    control.valueChanges.subscribe(value => {
      this.value.set(value);
      this.updateErrorMessage();
    });

    control.statusChanges.subscribe(() => {
      this.updateErrorMessage();
    });
  }

  private updateErrorMessage(): void {
    this.errorMessage.set(this.computeErrorMessage());
  }

  private computeErrorMessage(): string {
    const control = this.control();
    if (!control || !control.invalid) return '';

    if (!(control.touched || control.dirty || this.isParentFormSubmitted())) {
      return '';
    }

    const errors: ValidationErrors = control.errors ?? {};
    if (errors['error']) {
      return String(errors['error']);
    }

    const key = Object.keys(errors)[0]?.toLowerCase();
    if (!key) return '';

    const validations = this.node().dataType?.validations ?? [];
    const match = validations.find(v => v.name?.toLowerCase() === key);
    if (match?.message) return match.message;

    return this.defaultMessage(key, errors[key]);
  }

  private isParentFormSubmitted(): boolean {
    let parent = this.control()?.parent;
    while (parent) {
      if (parent instanceof FormGroupDirective || parent instanceof NgForm) {
        return parent.submitted;
      }
      parent = parent.parent;
    }
    return false;
  }

  private defaultMessage(key: string, err: any): string {
    const t = (k: string, p?: any) =>
      this.translate.instant(k, p);

    switch (key) {
      case 'required':
        return t('VALIDATION.REQUIRED', {fieldName: this.label()});
      case 'minlength':
        return t('ERROR.MIN_LENGTH', err);
      case 'maxlength':
        return t('ERROR.MAX_LENGTH', err);
      case 'min':
        return t('ERROR.MIN', err);
      case 'max':
        return t('ERROR.MAX', err);
      case 'pattern':
        return t('ERROR.PATTERN');
      case 'email':
        return t('ERROR.EMAIL');
      default:
        return t('ERROR.INVALID_FIELD');
    }
  }
}

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ConfigHyperparamEditModel} from "@shared-lib/modules/app-execution/model/config";
import {ToolConfigHyperParamDataType} from "@shared-lib/modules/app-execution/dto/config";
import {TranslatePipe} from "@ngx-translate/core";
import {HyperParamValidationService} from "@shared-lib/modules/app-execution/service/hyper-param-validation.service";

@Component({
  selector: 'lib-app-hyper-param-input',
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule, TranslatePipe,
  ],
  templateUrl: './app-hyper-param-input.component.html',
  styleUrl: './app-hyper-param-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHyperParamInputComponent implements OnInit, OnChanges {
  protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected readonly hyperParamValidationService: HyperParamValidationService = inject(HyperParamValidationService)
  protected readonly FederatedAppConfigHyperParamDataType = ToolConfigHyperParamDataType;

  hyperparam = input.required<ConfigHyperparamEditModel>();
  label = input<string>();
  showTooltip = input<boolean>(false);
  value = input<string>();
  allowMultiple = input<boolean>(false);

  valueChanged = output<string>();
  valuesChanged = output<string[]>();
  validChanged = output<boolean>();

  parsedLabel = signal<string | undefined>(this.label());
  formControl = new FormControl('', [Validators.required]);
  errorMessages: string[] = [];
  private firstVisit: boolean = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes["hyperparam"] && !this.firstVisit) {

      this.setup();
    }
  }

  ngOnInit(): void {
    this.setup();
    this.firstVisit = false;
  }

  setup(): void {
    const hyperparam = this.hyperparam();
    const validators = [];

    this.parsedLabel.set(this.label() || hyperparam.name);

    if (hyperparam.type !== ToolConfigHyperParamDataType.STRING) {
      validators.push(Validators.required);
    }

    if (!this.allowMultiple()) {
      switch (hyperparam.type) {
        case ToolConfigHyperParamDataType.INTEGER:
          if (hyperparam.minValue != null) {
            validators.push(Validators.min(hyperparam.minValue));
          }
          if (hyperparam.maxValue != null) {
            validators.push(Validators.max(hyperparam.maxValue));
          }
          validators.push(Validators.pattern('^-?\\d+$'));
          break;

        case ToolConfigHyperParamDataType.FLOAT:
          if (hyperparam.minValue != null) {
            validators.push(Validators.min(hyperparam.minValue));
          }
          if (hyperparam.maxValue != null) {
            validators.push(Validators.max(hyperparam.maxValue));
          }
          break;

        case ToolConfigHyperParamDataType.STRING:
          if (hyperparam.pattern) {
            validators.push(Validators.pattern(hyperparam.pattern));
            validators.push(Validators.required);
          }
          break;
      }
    } else {
      if (
        hyperparam.type === ToolConfigHyperParamDataType.FLOAT ||
        hyperparam.type === ToolConfigHyperParamDataType.INTEGER
      ) {
        if (hyperparam.minValue != null) {
          validators.push(Validators.min(hyperparam.minValue));
        }
        if (hyperparam.maxValue != null) {
          validators.push(Validators.max(hyperparam.maxValue));
        }
        if (hyperparam.type === ToolConfigHyperParamDataType.INTEGER) {
          validators.push(Validators.pattern('^-?\\d+$'));
        }
      }

      if (
        hyperparam.type === ToolConfigHyperParamDataType.STRING &&
        hyperparam.pattern
      ) {
        validators.push(Validators.pattern(hyperparam.pattern));
      }
    }

    this.formControl.setValidators(validators);

    if (hyperparam.default !== undefined && hyperparam.default !== null) {
      this.formControl.setValue(hyperparam.default, {emitEvent: false});
    } else {
      this.formControl.setValue('', {emitEvent: false});
    }

    if (this.value() !== undefined && this.value() !== null) {
      this.formControl.setValue(this.value()!, {emitEvent: false});
    }

    this.formControl.updateValueAndValidity({emitEvent: false});

    this.formControl.valueChanges.subscribe(() => {
      if (this.allowMultiple()) {
        this.validateInputValues();
      }
      this.publishValue();
    });

    this.publishValue();
    this.cdr.detectChanges();
  }

  publishValue() {
    if (this.formControl.invalid) {
      this.cdr.detectChanges();
      this.validChanged.emit(false);
      return;
    }
    this.valueChanged.emit(this.formControl.value!);
    if (this.allowMultiple()) {
      const hyperParam = this.hyperparam();
      const input = this.formControl.value;
      const parsedValues = this.hyperParamValidationService.getParsedValues(input, hyperParam);
      if (parsedValues === null || this.errorMessages.length > 0) {
        this.cdr.detectChanges();
        this.validChanged.emit(false);
        return;
      }
      this.valuesChanged.emit(parsedValues);
    }
    this.validChanged.emit(true);
  }

  validateInputValues() {
    const hyperParam = this.hyperparam();
    const input = this.formControl.value;
    const result = this.hyperParamValidationService.validateInputValues(input, hyperParam);
    this.errorMessages = result.errors;
    if (!result.ok) {
      this.formControl.setErrors({invalid: true});
    } else {
      this.formControl.setErrors(null);
    }
  }
}

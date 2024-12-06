import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter, inject,
  Input, OnChanges,
  OnInit,
  Output, SimpleChanges
} from '@angular/core';
import {ConfigHyperparamEditModel} from "../../../../model/config";
import {CommonModule} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {FederatedAppConfigHyperParamDataType} from "../../../../dto/config";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-app-hyper-param-input',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule],
  templateUrl: './app-hyper-param-input.component.html',
  styleUrl: './app-hyper-param-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHyperParamInputComponent implements OnInit, OnChanges {
  protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected readonly FederatedAppConfigHyperParamDataType = FederatedAppConfigHyperParamDataType;

  @Input() hyperparam: ConfigHyperparamEditModel;
  @Input() label?: string;
  @Input() showTooltip: boolean = false;
  @Input() value?: string;
  @Input() allowMultiple: boolean = false;

  @Output() valueChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() valuesChanged: EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() validChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

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
    if (!this.label) {
      this.label = this.hyperparam.name;
    }
    if (this.hyperparam.default) {
      this.formControl.setValue(this.hyperparam.default);
    }
    if (this.value) {
      this.formControl.setValue(this.value);
    }
    if (this.allowMultiple) {
      if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.FLOAT ||
        this.hyperparam.type === FederatedAppConfigHyperParamDataType.INTEGER) {
        if (this.hyperparam.minValue) {
          this.formControl.addValidators(Validators.min(this.hyperparam.minValue));
        }
        if (this.hyperparam.maxValue) {
          this.formControl.addValidators(Validators.max(this.hyperparam.maxValue));
        }
        if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.INTEGER) {
          this.formControl.addValidators(Validators.pattern('^[0-9]*$'));
        }
      }
      if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.STRING && this.hyperparam.pattern) {
        this.formControl.addValidators(Validators.pattern(this.hyperparam.pattern));
      }
    }
    // Publish value on form edit
    this.formControl.valueChanges.subscribe(() => {
      if (this.allowMultiple) {
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
    if (this.allowMultiple) {
      const parsedValues = this.getParsedValues();
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
    this.errorMessages = [];
    const values = this.getParsedValues();
    if (values === null) {
      this.formControl.setErrors({invalid: true});
      this.errorMessages.push('Input is required');
      return;
    }
    let hasError = false;
    values.forEach(part => {
      if (this.isNumber()) {
        if (this.hyperparam.minValue && part < this.hyperparam.minValue) {
          this.errorMessages.push(`Value ‘${part}’ is less than the minimum ${this.hyperparam.minValue}`);
          hasError = true;
        }
        if (this.hyperparam.maxValue && part > this.hyperparam.maxValue) {
          this.errorMessages.push(`Value ‘${part}’ is greater than the maximum ${this.hyperparam.maxValue}`);
          hasError = true;
        }
      }
      if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.STRING && this.hyperparam.pattern) {
        if (!new RegExp(this.hyperparam.pattern).test(part)) {
          this.errorMessages.push(`Value ‘${part}’ does not match the pattern. ${this.hyperparam.pattern}`);
          hasError = true;
        }
      }
      if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.CATEGORICAL && this.hyperparam.options
        && !this.hyperparam.options.includes(part)) {
        this.errorMessages.push(`Value ‘${part}’ is not a valid option`);
        hasError = true;
      }
    });
    if (hasError) {
      this.formControl.setErrors({invalid: true});
    } else {
      this.formControl.setErrors(null);
    }
  }

  getParsedValues(): any[] | null {
    const input = this.formControl.value;
    if (!input) {
      return null;
    }
    const values: any[] = [];
    const parts = input.split(',');

    parts.forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        if (this.isNumber()) {
          const start = this.parseValue(startStr);
          const end = this.parseValue(endStr);
          if (start !== null && end !== null) {
            for (let i = start; i <= end; i += this.getStep()) {
              values.push(parseFloat(i.toFixed(10)));
            }
          }
        }
      } else {
        if (this.isNumber()) {
          const value = this.parseValue(part);
          if (value !== null) {
            values.push(value);
          }
        } else if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.BOOLEAN) {
          values.push(part === 'true');
        } else {
          if (part) {
            values.push(part);
          }
        }

      }
    });
    return values;
  }

  isNumber(): boolean {
    return this.hyperparam.type === FederatedAppConfigHyperParamDataType.INTEGER ||
      this.hyperparam.type === FederatedAppConfigHyperParamDataType.FLOAT;
  }


  getStep(): number {
    if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.INTEGER) {
      return 1;
    } else if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.FLOAT) {
      return 0.1;
    }
    return 1;
  }

  parseValue(valueStr: string): number | null {
    let value: number;

    if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.INTEGER) {
      value = parseInt(valueStr, 10);
      if (isNaN(value) || !/^-?\d+$/.test(valueStr)) {
        return null;
      }
    } else if (this.hyperparam.type === FederatedAppConfigHyperParamDataType.FLOAT) {
      value = parseFloat(valueStr);
      if (isNaN(value) || !/^-?\d+(\.\d+)?$/.test(valueStr)) {
        return null;
      }
    } else {
      return null;
    }
    return value;
  }


}

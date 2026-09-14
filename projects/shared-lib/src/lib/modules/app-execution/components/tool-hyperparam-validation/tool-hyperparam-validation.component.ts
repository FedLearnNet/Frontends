import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {ToolHyperParamConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {HyperParamValidationService} from "@shared-lib/modules/app-execution/service/hyper-param-validation.service";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {
  RemoteToolInputValidationService
} from "../../../../../../../global-app/src/app/modules/tool-development/service/tool-input-validation.service";
import {toSignal} from "@angular/core/rxjs-interop";
import {firstValueFrom} from "rxjs";

@Component({
  selector: 'lib-tool-hyperparam-validation',
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule, BadgeComponent, ErrorCardComponent, HintCardComponent,],
  templateUrl: './tool-hyperparam-validation.component.html',
  styleUrl: './tool-hyperparam-validation.component.scss',
})
export class ToolHyperparamValidationComponent {
  private readonly validationService: HyperParamValidationService = inject(HyperParamValidationService);
  private readonly remoteValidationService: RemoteToolInputValidationService = inject(RemoteToolInputValidationService);
  readonly hyperparam = input.required<ToolHyperParamConfigDTO>();

  readonly formControl = new FormControl<string>('', {nonNullable: true});

  readonly errorMessages = signal<string[]>([]);
  readonly lastValidatedAt = signal<Date | null>(null);
  readonly validatingRemote = signal(false);

  readonly hasErrors = computed(() => this.errorMessages().length > 0);

  readonly toValidateValue = toSignal(
    this.formControl.valueChanges,
    {initialValue: this.formControl.value}
  );

  readonly remoteTrigger = signal(0);


  constructor() {
    effect(() => {
      this.hyperparam();
      this.formControl.setValue('', {emitEvent: false});
      this.errorMessages.set([]);
      this.formControl.setErrors(null);
      this.lastValidatedAt.set(null);
    });

    effect(() => {
      const _ = this.toValidateValue();
      this.validateInputValues();
      const input = (this.formControl.value ?? '').trim();
      if (!input) {
        this.lastValidatedAt.set(null);
        this.errorMessages.set([]);
      }
    });

    effect(async () => {
      const _ = this.remoteTrigger();

      const input = (this.formControl.value ?? '').trim();
      if (!input) return;

      const hp = this.hyperparam();
      this.validatingRemote.set(true);
      try {
        const res = await firstValueFrom(this.remoteValidationService.validateHyperParamValues(input, hp));
        this.errorMessages.set(res.errors ?? []);
        this.formControl.setErrors(res.ok ? null : {invalid: true, remote: true});
        this.lastValidatedAt.set(new Date());
      } finally {
        this.validatingRemote.set(false);
      }
    });
  }


  validateInputValues() {
    const hyperParam = this.hyperparam();
    const input = (this.formControl.value ?? '').trim();
    if (!input) return;
    const result = this.validationService.validateInputValues(input, hyperParam);
    this.errorMessages.set(result.errors ?? []);

    if (!result.ok) {
      this.formControl.setErrors({invalid: true});
    } else {
      this.formControl.setErrors(null);
    }

    this.lastValidatedAt.set(new Date());
  }

}

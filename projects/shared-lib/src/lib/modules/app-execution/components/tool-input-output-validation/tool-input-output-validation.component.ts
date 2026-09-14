import {Component, computed, effect, inject, input, signal} from '@angular/core';
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
import {ToolConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {toSignal} from "@angular/core/rxjs-interop";
import {firstValueFrom} from "rxjs";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {MatOption, MatSelect} from "@angular/material/select";

@Component({
  selector: 'lib-tool-input-output-validation',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    BadgeComponent,
    ErrorCardComponent,
    HintCardComponent,
    MatSelect,
    MatOption
  ],
  templateUrl: './tool-input-output-validation.component.html',
  styleUrl: './tool-input-output-validation.component.scss',
})
export class ToolInputOutputValidationComponent {
  private readonly remoteValidationService: RemoteToolInputValidationService = inject(RemoteToolInputValidationService);
  readonly config = input.required<ToolConfigDTO>();
  readonly files = input.required<FileDTO[]>();

  readonly formControl = new FormControl<number |undefined>(undefined, {nonNullable: true});

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
      this.config();
      this.formControl.setValue(undefined, {emitEvent: false});
      this.errorMessages.set([]);
      this.formControl.setErrors(null);
      this.lastValidatedAt.set(null);
    });

    effect(async () => {
      const _ = this.toValidateValue();

      const input = this.formControl.value;
      if (!input) {
        this.lastValidatedAt.set(null);
        this.errorMessages.set([]);
        return;
      }
      const cfg = this.config();
      this.validatingRemote.set(true);
      try {
        const res = await firstValueFrom(this.remoteValidationService.validateFile(Number(input), cfg));
        this.errorMessages.set(res.errors ?? []);
        this.formControl.setErrors(res.ok ? null : {invalid: true, remote: true});
        this.lastValidatedAt.set(new Date());
      } finally {
        this.validatingRemote.set(false);
      }
    });
  }
}

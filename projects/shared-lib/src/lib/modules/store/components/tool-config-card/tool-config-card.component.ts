import {Component, computed, inject, input, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {
  ToolHyperParamConfigDTO,
  ToolInputConfigDTO,
  ToolOutputConfigDTO,
} from "@shared-lib/modules/app-execution/dto/config";

import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

import {
  ToolInputOutputValidationComponent
} from "@shared-lib/modules/app-execution/components/tool-input-output-validation/tool-input-output-validation.component";
import {
  ToolHyperparamValidationComponent
} from "@shared-lib/modules/app-execution/components/tool-hyperparam-validation/tool-hyperparam-validation.component";
import {selectAllFiles} from "@shared-lib/modules/files/store/file.selectors";
import {Store} from "@ngrx/store";

@Component({
  selector: 'lib-tool-config-card',
  standalone: true,
  imports: [
    MatIcon,
    MatButtonModule,
    KvComponent,
    BadgeComponent,
    ToolInputOutputValidationComponent,
    ToolHyperparamValidationComponent
  ],
  templateUrl: './tool-config-card.component.html',
  styleUrl: './tool-config-card.component.scss',
})
export class ToolConfigCardComponent {
  private readonly store: Store = inject(Store);

  hyperparamConfig = input<ToolHyperParamConfigDTO>();
  inputConfig = input<ToolInputConfigDTO>();
  outputConfig = input<ToolOutputConfigDTO>();

  showValidate = signal(false);
  readonly files = this.store.selectSignal(selectAllFiles);

  isIO = computed(() => !!(this.inputConfig() || this.outputConfig()));
  isHyperparamConfig = computed(() => !!this.hyperparamConfig());

  config = computed(() => this.hyperparamConfig() ?? this.inputConfig() ?? this.outputConfig());
  ioConfig = computed(() => this.inputConfig() ?? this.outputConfig());

  title = computed(() => this.config()?.name ?? 'Config');

  typeText = computed(() => {
    const c: any = this.config();
    return c?.type ?? 'UNKNOWN';
  });

  isRequiredInput = computed(() => !!this.inputConfig()?.required);

  toggleValidate() {
    this.showValidate.update(v => !v);
  }

}

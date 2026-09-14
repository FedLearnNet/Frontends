import {ChangeDetectionStrategy, Component, computed, effect, input, model, output, untracked} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {
  AppHyperParamInputComponent
} from "@shared-lib/modules/app-execution/components/app-hyper-param-input/app-hyper-param-input.component";
import {
  ToolConfigHyperParamDataType,
  ToolConfigModeType,
  ToolHyperParamConfigDTO
} from "@shared-lib/modules/app-execution/dto/config";
import {TranslatePipe} from "@ngx-translate/core";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {MatTableModule} from "@angular/material/table";
import {MatSelectModule} from "@angular/material/select";

export type Mode = 'TABLE' | 'LIST';


@Component({
  selector: 'lib-app-run-hyperparameter',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    AppHyperParamInputComponent,
    TranslatePipe,
    SkeletonLoaderComponent,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './app-run-hyperparameter.component.html',
  styleUrl: './app-run-hyperparameter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRunHyperparameterComponent {
  app = input<AppDetailDto>();
  version = input<AppVersionDto>();
  allowMods = input<ToolConfigModeType[]>([ToolConfigModeType.BOTH,
    ToolConfigModeType.TRAINING]);
  hyperParams = model<{ [key: string]: any }>({});
  allowMultiple = input<boolean>(false);
  mode = input<Mode>('LIST');
  columns = input<string[] | undefined>(undefined);

  multiHyperParamsChanged = output<{ [key: string]: any[] }>();
  formsValid = output<boolean>();

  allValid: { [key: string]: any } = {};
  multiHyperParams: { [key: string]: any[] } = {};

  allowColumnInputs = computed(() => {
    const columns = this.columns();
    return !!(columns && columns.length > 0);
  });

  displayedColumns = computed(() => {
    const allowColumnInputs = this.allowColumnInputs();
    if (allowColumnInputs) {
      return ['name', 'column', 'value'];
    }
    return ['name', 'value'];
  });

  constructor() {
    effect(() => {
      const app = this.app();
      const version = this.version();
      if (!app && !version) return;

      untracked(() => {
        const current = this.hyperParams();
        const defs = this.getHyperParams();

        const next = {...current};
        for (const hp of defs) {
          const name = this.getHyperParamName(hp);
          if (next[name] === undefined) {
            let def: any = hp.default;
            if (
              hp.type === ToolConfigHyperParamDataType.FLOAT ||
              hp.type === ToolConfigHyperParamDataType.INTEGER
            ) def = Number(def);
            next[name] = def;
          }
        }

        if (!this.shallowEqual(current, next)) {
          this.hyperParams.set(next);
        }
      });
    });
  }

  shallowEqual(a: Record<string, any>, b: Record<string, any>): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(k => Object.is(a[k], b[k]));
  }

  getHyperParams(): ToolHyperParamConfigDTO[] {
    if (this.app()) {
      return this.app()?.appConfig.hyperparams.filter(
        (hyperparam) => this.hyperParamModeApplies(hyperparam)
      ) ?? [];
    }
    if (this.version) {
      return this.version()?.appConfig.hyperparams.filter(
        (hyperparam) => this.hyperParamModeApplies(hyperparam)
      ) ?? [];
    }
    return [];
  }

  hyperParamModeApplies(hyperparam: ToolHyperParamConfigDTO): boolean {
    if (this.allowMods().includes(ToolConfigModeType.BOTH)) {
      return true;
    }
    if (this.allowMods().includes(ToolConfigModeType.TRAINING) && hyperparam.mode === ToolConfigModeType.TRAINING) {
      return true;
    }
    return this.allowMods().includes(ToolConfigModeType.PREDICTION) && hyperparam.mode === ToolConfigModeType.PREDICTION;
  }

  private getHyperParamName(hyperparam: ToolHyperParamConfigDTO): string {
    return hyperparam.variableName ? hyperparam.variableName : hyperparam.name;
  }

  public validateForms(hyperparam: ToolHyperParamConfigDTO, value: boolean) {
    this.allValid[this.getHyperParamName(hyperparam)] = value;
    this.formsValid.emit(Object.values(this.allValid).every((value) => value));
  }

  public getHyperParamValue(hyperparam: ToolHyperParamConfigDTO): string {
    return this.hyperParams()[this.getHyperParamName(hyperparam)];
  }

  public emitMultiHyperParamsChanged(hyperparam: ToolHyperParamConfigDTO, values: string[]) {
    this.multiHyperParams[this.getHyperParamName(hyperparam)] = values;
    this.multiHyperParamsChanged.emit(this.multiHyperParams);
  }

  public emitHyperParamsChanged(hyperparam: ToolHyperParamConfigDTO, value: string) {
    this.hyperParams.update(params => {
      const updated = {...params};
      updated[this.getHyperParamName(hyperparam)] = value;
      return updated;
    });
  }
}

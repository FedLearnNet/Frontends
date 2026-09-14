import {Component, computed, effect, inject, input, model, output, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ConfigPydanticDTO} from '../../../../dto/config';

import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatOptionModule} from '@angular/material/core';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';

import {MarkdownComponent, provideMarkdown} from 'ngx-markdown';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';

import {AppDetailConfigModeIconComponent} from '../app-detail-config-mode-icon/app-detail-config-mode-icon.component';
import {
  AppHyperParamInputComponent
} from '@shared-lib/modules/app-execution/components/app-hyper-param-input/app-hyper-param-input.component';

import {
  ConfigDataTypeOption,
  ConfigDataTypeSelectionArray,
  ConfigHyperparamEditModel,
} from '@shared-lib/modules/app-execution/model/config';
import {ToolConfigHyperParamDataType, ToolConfigModeType} from '@shared-lib/modules/app-execution/dto/config';
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {
  ToolHyperparamValidationComponent
} from "@shared-lib/modules/app-execution/components/tool-hyperparam-validation/tool-hyperparam-validation.component";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {TOOL_TYPE_CONFIG_MAP} from "../../../../model/tool-config-type";
import {
  MarkdownDialogComponent,
  MarkdownDialogData
} from "@shared-lib/components/markdown-dialog/markdown-dialog.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-app-detail-config-hyperparam',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MarkdownComponent,
    MatTooltipModule,
    MatSelectModule,
    MatOptionModule,
    AppDetailConfigModeIconComponent,
    MatChipsModule,
    AppHyperParamInputComponent,
    TranslatePipe,
    KvComponent,
    ToolHyperparamValidationComponent,
    BtnComponent,
  ],
  providers: [provideMarkdown()],
  templateUrl: './app-detail-config-hyperparam.component.html',
  styleUrl: './app-detail-config-hyperparam.component.scss',
})
export class AppDetailConfigHyperparamComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly translateService: TranslateService = inject(TranslateService);
  protected readonly FederatedAppConfigHyperParamDataType = ToolConfigHyperParamDataType;

  readonly pydanticClass = input<ConfigPydanticDTO>();
  readonly editMode = input<boolean | undefined>(true);
  readonly toolType = input<FederatedAppType>();

  readonly hyperparams = model<ConfigHyperparamEditModel[]>([]);
  readonly configChanged = output<ConfigHyperparamEditModel[]>();

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly toolConfigDataTypes: ConfigDataTypeOption[] = ConfigDataTypeSelectionArray;

  private readonly _emitKey = signal(0);

  readonly supportsTraining = computed(() => {
    if (this.toolType() === undefined) return false;
    return TOOL_TYPE_CONFIG_MAP[this.toolType()!]?.supportsTraining ?? false;
  });

  constructor() {
    effect(() => {
      this._emitKey();
      this.configChanged.emit(this.hyperparams());
    });
  }

  addParam() {
    this.hyperparams.update(list => [
      ...list,
      {
        name: '',
        type: ToolConfigHyperParamDataType.INTEGER,
        description: '',
        default: '',
        editMode: true,
        edited: true,
        mode: ToolConfigModeType.TRAINING,
      },
    ]);
    this._emitKey.update(v => v + 1);
  }

  removeParam(el: ConfigHyperparamEditModel) {
    this.hyperparams.update(list => list.filter(h => h !== el));
    this._emitKey.update(v => v + 1);
  }

  editParam(el: ConfigHyperparamEditModel) {
    if (!el.editMode) {
      el.edited = false;
    }
    el.editMode = !el.editMode;
    this.hyperparams.update(list => [...list]);
  }

  toggleValidate(el: ConfigHyperparamEditModel) {
    el.showValidate = !el.showValidate;
    this.hyperparams.update(list => [...list]);
  }

  saveParam(el: ConfigHyperparamEditModel) {
    el.editMode = false;
    this.hyperparams.update(list => [...list]);
    this._emitKey.update(v => v + 1);
  }

  readonly pydanticMarkdown = computed(() => {
    const p = this.pydanticClass();
    return p ? '```python\n' + p.hyperparam + '\n```' : '';
  });

  openPydanticClassDialog() {
    this.dialog.open(MarkdownDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        title: this.translateService.instant('MENU.PYDANTIC_CLASS'),
        markdown: this.pydanticMarkdown(),
        copyToClipboard: true,
      } as MarkdownDialogData,
    });
  }

  addOption(param: ConfigHyperparamEditModel, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      param.edited = true;
      param.options = [...(param.options ?? []), value];
      this.hyperparams.update(list => [...list]);
      this._emitKey.update(v => v + 1);
    }
    event.chipInput?.clear();
  }

  removeOption(param: ConfigHyperparamEditModel, option: string): void {
    if (!param.options) return;
    param.options = param.options.filter(o => o !== option);
    param.edited = true;
    this.hyperparams.update(list => [...list]);
    this._emitKey.update(v => v + 1);
  }

  editOption(param: ConfigHyperparamEditModel, option: string, event: MatChipEditedEvent) {
    if (!param.options) return;
    const value = event.value.trim();
    if (!value) {
      this.removeOption(param, option);
      return;
    }
    param.edited = true;
    param.options = param.options.map(o => (o === option ? value : o));
    this.hyperparams.update(list => [...list]);
    this._emitKey.update(v => v + 1);
  }

  touch() {
    this.hyperparams.set([...this.hyperparams()]);
  }

  setParamField<T extends keyof ConfigHyperparamEditModel>(
    param: ConfigHyperparamEditModel,
    key: T,
    value: ConfigHyperparamEditModel[T]
  ) {
    if ((param[key] as any) !== value) {
      (param[key] as any) = value;
      param.edited = true;
      this.touch();
    }
  }
}

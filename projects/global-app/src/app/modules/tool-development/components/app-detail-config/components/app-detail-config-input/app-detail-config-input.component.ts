import {Component, computed, inject, input, model} from '@angular/core';

import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {MatCheckboxModule} from "@angular/material/checkbox";

import {ToolConfigDataType, ToolConfigModeType} from "@shared-lib/modules/app-execution/dto/config";
import {ConfigInputEditModel} from "@shared-lib/modules/app-execution/model/config";
import {ConfigPydanticDTO} from "../../../../dto/config";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {AppDetailConfigElementComponent} from "../app-detail-config-element/app-detail-config-element.component";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {TOOL_TYPE_CONFIG_DEFAULT_OPTIONS, TOOL_TYPE_CONFIG_MAP} from "../../../../model/tool-config-type";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {MatDialog} from "@angular/material/dialog";
import {
  AppConfigRemoteConfigSelectionDialogComponent
} from "../app-config-remote-config-selection-dialog/app-config-remote-config-selection-dialog.component";
import {
  MarkdownDialogComponent,
  MarkdownDialogData
} from "@shared-lib/components/markdown-dialog/markdown-dialog.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-app-detail-config-input',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MarkdownComponent,
    TranslatePipe,
    AppDetailConfigElementComponent,
    HintCardComponent,
    BtnComponent
  ],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './app-detail-config-input.component.html',
  styleUrl: './app-detail-config-input.component.scss'
})
export class AppDetailConfigInputComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly translateService: TranslateService = inject(TranslateService);
  readonly toolType = input<FederatedAppType>();

  readonly editMode = input<boolean | undefined>(true);
  readonly pydanticClass = input<ConfigPydanticDTO>();
  readonly configs = model<ConfigInputEditModel[]>([]);
  readonly files = input<FileDTO[]>([]);

  readonly configOptions = computed(() => {
    if (this.toolType() === undefined) return TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
    return TOOL_TYPE_CONFIG_MAP[this.toolType()!] ?? TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
  });

  readonly supportsTraining = computed(() => {
    return this.configOptions().supportsTraining;
  });

  readonly canEditMode = computed(() => {
    const editMode = this.editMode();
    const supportsEdit = this.configOptions().canEditInputConfig;
    return supportsEdit && editMode;
  });

  addParam() {
    this.configs.update(configs => [...configs, {
      name: '',
      type: ToolConfigDataType.CSV,
      description: '',
      editMode: true,
      required: false,
      mode: ToolConfigModeType.TRAINING
    }]);
  }

  openRemoteConfigDialog() {
    this.dialog.open(AppConfigRemoteConfigSelectionDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '90vw',
      autoFocus: false,
    }).afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.configs.update(configs => [...configs, result]);
    });

  }

  removeParam(el: ConfigInputEditModel) {
    this.configs.update(configs => configs.filter(h => h !== el));
  }

  updateConfig(el: ConfigInputEditModel, newConfig?: ConfigInputEditModel) {
    if (!newConfig) {
      return;
    }
    this.configs.update(configs => configs.map(config => config === el ? newConfig : config));
  }

  getPydanticClass(): string {
    const pydanticClass = this.pydanticClass();
    if (pydanticClass) {
      return "```python\n" + pydanticClass.input + "\n```";
    }
    return '';
  }

  openPydanticClassDialog() {
    this.dialog.open(MarkdownDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        title: this.translateService.instant('MENU.PYDANTIC_CLASS'),
        markdown: this.getPydanticClass(),
        copyToClipboard: true,
      } as MarkdownDialogData,
    });
  }
}

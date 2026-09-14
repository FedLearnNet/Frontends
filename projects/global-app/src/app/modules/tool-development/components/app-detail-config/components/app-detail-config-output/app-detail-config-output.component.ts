import {Component, computed, inject, input, model} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";

import {MatMenuModule} from "@angular/material/menu";
import {ConfigPydanticDTO} from "../../../../dto/config";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";

import {ConfigOutputEditModel} from "@shared-lib/modules/app-execution/model/config";
import {ToolConfigDataType, ToolConfigModeType,} from "@shared-lib/modules/app-execution/dto/config";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {AppDetailConfigElementComponent} from "../app-detail-config-element/app-detail-config-element.component";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {TOOL_TYPE_CONFIG_DEFAULT_OPTIONS, TOOL_TYPE_CONFIG_MAP} from "../../../../model/tool-config-type";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {
  AppConfigRemoteConfigSelectionDialogComponent
} from "../app-config-remote-config-selection-dialog/app-config-remote-config-selection-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {
  MarkdownDialogComponent,
  MarkdownDialogData
} from "@shared-lib/components/markdown-dialog/markdown-dialog.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-app-detail-config-output',
  imports: [MatInputModule, ReactiveFormsModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule, MatMenuModule, MatButtonModule, MatSelectModule, MarkdownComponent, TranslatePipe, AppDetailConfigElementComponent, HintCardComponent, BtnComponent],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './app-detail-config-output.component.html',
  styleUrl: './app-detail-config-output.component.scss'
})
export class AppDetailConfigOutputComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly translateService: TranslateService = inject(TranslateService);

  readonly toolType = input<FederatedAppType>();
  readonly pydanticClass = input<ConfigPydanticDTO>();
  readonly editMode = input<boolean | undefined>(true);
  readonly files = input<FileDTO[]>([]);

  readonly configs = model<ConfigOutputEditModel[]>([]);

  readonly configOptions = computed(() => {
    if (this.toolType() === undefined) return TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
    return TOOL_TYPE_CONFIG_MAP[this.toolType()!] ?? TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
  });

  readonly supportsTraining = computed(() => {
    return this.configOptions().supportsTraining;
  });

  readonly canEditMode = computed(() => {
    const editMode = this.editMode();
    const supportsEdit = this.configOptions().canEditOutputConfig;
    return supportsEdit && editMode;
  });

  updateConfig(el: ConfigOutputEditModel, newConfig?: ConfigOutputEditModel) {
    if (!newConfig) {
      return;
    }
    this.configs.update(configs => configs.map(config => config === el ? newConfig : config));
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

  removeParam(el: ConfigOutputEditModel) {
    this.configs.update(configs => configs.filter(h => h !== el));
  }

  getPydanticClass(): string {
    const pydanticClass = this.pydanticClass();
    if (pydanticClass) {
      return "```python\n" + pydanticClass.output + "\n```";
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

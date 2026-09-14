import {Component, computed, effect, inject, input, model, output, signal, untracked} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';

import {MatInputModule} from "@angular/material/input";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {provideMarkdown} from "ngx-markdown";
import {TranslatePipe} from "@ngx-translate/core";

import {AppDetailConfigModeIconComponent} from "../app-detail-config-mode-icon/app-detail-config-mode-icon.component";
import {TabularSchemaDTO, ToolConfigDataType} from "@shared-lib/modules/app-execution/dto/config";
import {ConfigInputEditModel, ConfigOutputEditModel} from "@shared-lib/modules/app-execution/model/config";
import {
  AppDetailConfigTableElementDialogComponent
} from "../app-detail-config-table-element-dialog/app-detail-config-table-element-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {
  ToolInputOutputValidationComponent
} from "@shared-lib/modules/app-execution/components/tool-input-output-validation/tool-input-output-validation.component";
import {FileDTO} from "@shared-lib/modules/files/dto/file";

type FormValue = {
  name: string;
  type: ToolConfigDataType;
  required: boolean | null;
  shape: string;
  delimiter: string;
  hasHeader: boolean;
  indexCol: number | null;
  minValue: number | null;
  maxValue: number | null;
  description: string;
};


@Component({
  selector: 'app-detail-config-element',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    AppDetailConfigModeIconComponent,
    TranslatePipe,
    KvComponent,
    ToolInputOutputValidationComponent
  ],
  providers: [provideMarkdown()],
  templateUrl: './app-detail-config-element.component.html',
  styleUrl: './app-detail-config-element.component.scss'
})
export class AppDetailConfigElementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialog: MatDialog = inject(MatDialog);

  readonly editMode = input<boolean | undefined>(true);
  readonly hideMode = input<boolean | undefined>(false);
  readonly hideDelete = input<boolean | undefined>(false);
  readonly supportsTraining = input<boolean>(false);
  readonly files = input<FileDTO[]>([]);

  inputConfig = model<ConfigInputEditModel>();
  outputConfig = model<ConfigOutputEditModel>();
  removeConfig = output<boolean>();

  showValidate = signal<boolean>(false);

  readonly forInputConfig = computed<boolean>(() => {
    const i = this.inputConfig();
    return !!i;
  });

  readonly param = computed<ConfigInputEditModel>(() => {
    const i = this.inputConfig();
    if (i) return i as any;
    return this.outputConfig()!;
  });

  readonly form = this.fb.group({
    name: this.fb.control<string>("", {validators: [Validators.required]}),
    type: this.fb.control<ToolConfigDataType | null>(null, {validators: [Validators.required]}),
    required: this.fb.control(false),
    shape: this.fb.control<string | null>(null),
    delimiter: this.fb.control<string | null>(null),
    hasHeader: this.fb.control(false),
    indexCol: this.fb.control<number | null>(null),
    minValue: this.fb.control<number | null>(null),
    maxValue: this.fb.control<number | null>(null),
    description: this.fb.control<string | null>(null),
  });

  readonly toolConfigDataTypeText: { [key in ToolConfigDataType]: string } = {
    [ToolConfigDataType.HTML]: 'html',
    [ToolConfigDataType.CSV]: 'csv',
    [ToolConfigDataType.TSV]: 'tsv',
    [ToolConfigDataType.JSON]: 'json',
    [ToolConfigDataType.IMAGE]: 'image',
    [ToolConfigDataType.TEXT]: 'text',
    [ToolConfigDataType.MIXED]: 'mixed',
    [ToolConfigDataType.STRING]: 'string',
    [ToolConfigDataType.PATH]: 'path',
    [ToolConfigDataType.UNKNOWN]: 'unknown',
  };

  constructor() {
    effect(() => {
      const p = this.param();
      if (!p) return;

      untracked(() => {
        this.form.reset(this.toFormValue(p), {emitEvent: false});
        this.applyDynamicValidators(false);
      });
    });
  }

  toggleValidate() {
    this.showValidate.update(v => !v);
  }

  getDataTypes(): ToolConfigDataType[] {
    return Object.values(ToolConfigDataType);
  }

  editParam(): void {
    this.toggleEditMode(true);
  }

  saveParam(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const p = this.param();
    const formValue = this.form.getRawValue();
    const draft = this.fromFormValue(formValue as FormValue, p);

    if (this.forInputConfig()) {
      this.inputConfig.update(i => ({...(i as any), ...draft, editMode: false}) as ConfigInputEditModel);
    } else {
      this.outputConfig.update(o => ({...(o as any), ...draft, editMode: false}) as ConfigInputEditModel);
    }
  }

  deleteConfig(): void {
    this.removeConfig.emit(true);
  }

  onModeChanged(mode: any): void {
    if (this.forInputConfig()) {
      this.inputConfig.update(i => ({...(i as any), mode}) as ConfigInputEditModel);
    } else {
      this.outputConfig.update(o => ({...(o as any), mode}) as ConfigInputEditModel);
    }
  }

  private toggleEditMode(editMode: boolean): void {
    if (this.forInputConfig()) {
      this.inputConfig.update(i => ({...(i as any), editMode}) as ConfigInputEditModel);
    } else {
      this.outputConfig.update(o => ({...(o as any), editMode}) as ConfigInputEditModel);
    }
  }

  inputRequiresShape(): boolean {
    const formValue = this.form.getRawValue().type ?? ToolConfigDataType.UNKNOWN;
    return [ToolConfigDataType.MIXED].includes(formValue);
  }

  inputRequiresDelimiterAndHeader(): boolean {
    const formValue = this.form.getRawValue().type ?? ToolConfigDataType.UNKNOWN;
    return [ToolConfigDataType.CSV, ToolConfigDataType.TSV].includes(formValue);
  }

  inputRequiresConstraints(): boolean {
    return false;
  }

  private applyDynamicValidators(updateValidity: boolean): void {
    const shape = this.form.controls.shape;
    const delimiter = this.form.controls.delimiter;

    shape.clearValidators();
    delimiter.clearValidators();

    if (this.inputRequiresShape()) {
      shape.addValidators([Validators.required]);
    }

    if (this.inputRequiresDelimiterAndHeader()) {
      delimiter.addValidators([Validators.required, Validators.maxLength(5)]);
    }

    if (updateValidity) {
      shape.updateValueAndValidity({emitEvent: false});
      delimiter.updateValueAndValidity({emitEvent: false});
    }
  }

  private toFormValue(p: ConfigInputEditModel): FormValue {
    return {
      name: (p as any).name ?? null,
      type: (p as any).type ?? null,
      required: !!(p as any).required,
      shape: (p as any).shape ?? null,
      delimiter: (p as any).delimiter ?? null,
      hasHeader: !!(p as any).hasHeader,
      indexCol: (p as any).indexCol ?? null,
      minValue: (p as any).minValue ?? null,
      maxValue: (p as any).maxValue ?? null,
      description: (p as any).description ?? null,
    };
  }

  private fromFormValue(v: FormValue, p: ConfigInputEditModel): Partial<ConfigInputEditModel> {
    return {
      ...(p as any),
      name: v.name ?? (p as any).name,
      type: v.type ?? (p as any).type,
      required: v.required,
      shape: v.shape ?? undefined,
      delimiter: v.delimiter ?? undefined,
      hasHeader: v.hasHeader,
      indexCol: v.indexCol ?? undefined,
      minValue: v.minValue ?? undefined,
      maxValue: v.maxValue ?? undefined,
      description: v.description ?? undefined,
    } as any;
  }

  protected openTableSettings() {
    this.dialog.open(AppDetailConfigTableElementDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: this.param().tabularSchema
    }).afterClosed().subscribe((tabularSchema: TabularSchemaDTO | undefined) => {
      if (!tabularSchema) {
        return;
      }
      if (this.forInputConfig()) {
        this.inputConfig.update(i => ({...(i as any), tabularSchema}) as ConfigInputEditModel);
      } else {
        this.outputConfig.update(o => ({...(o as any), tabularSchema}) as ConfigInputEditModel);
      }
    });
  }
}

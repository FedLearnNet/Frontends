import {Component, computed, effect, input, model, signal} from '@angular/core';
import {
  AppTransformerMappings,
  FunctionExecutionMode,
  FunctionExecutionParameterType,
  FunctionParameterDTO,
  FunctionParameterUsage,
  FunctionsDetailDTO
} from "../../../../../../../local-app/src/app/modules/connector/dto/function";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";

import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {MatTableModule} from "@angular/material/table";
import {TranslatePipe} from "@ngx-translate/core";
import {
  AppRunHyperparameterComponent
} from "@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";


type RowFG = FormGroup<{
  functionName: FormControl<string>;
  key: FormControl<string>;
  doc: FormControl<string | null>;
  choices: FormControl<string[]>;
  column: FormControl<string>;
  value: FormControl<string>;
  type: FormControl<string>;
  defaultValue: FormControl<string>;
}>;

type ReturnFG = FormGroup<{
  key: FormControl<string>;
  doc: FormControl<string | null>;
  column: FormControl<string>;
  value: FormControl<string>;
}>;

type HyperparameterFG = FormGroup<{
  key: FormControl<string>;
  doc: FormControl<string | null>;
  choices: FormControl<string[]>;
  value: FormControl<string>;
  type: FormControl<string>;
}>;

@Component({
  selector: 'lib-app-run-transformer-row-mapping',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    BadgeComponent,
    MatTableModule,
    TranslatePipe,
    AppRunHyperparameterComponent,
    FormsModule,

  ],
  templateUrl: './app-run-transformer-row-mapping.component.html',
  styleUrl: './app-run-transformer-row-mapping.component.scss',
})
export class AppRunTransformerRowMappingComponent {
  private readonly fb: FormBuilder = new FormBuilder();

  function = input<FunctionsDetailDTO | null>();
  selectedTool = input<AppDetailDto | null>();
  readonly columns = input<string[]>([]);
  mapping = model<AppTransformerMappings>({
    column: undefined,
    hyperparams: {},
    inputMapping: {},
    returnMapping: {},
  });
  readonly selectedColumns = signal<string[]>([]);

  readonly selectedColumn = signal('');

  readonly displayedColumns = computed(() =>
    this.usesMappings() ? ['name', 'column', 'value'] : ['name', 'value']
  );
  displayedReturnColumns: string[] = ['name', 'column', 'new-column']; //'function',
  displayedHyperparameterColumns: string[] = ['name', 'value'];
  hyperParamValid: boolean = true;
  hyperParams: { [key: string]: string } = {};
  mapEntries: Map<string, { key: string; value: string }[]> = new Map();

  readonly form = this.fb.group({
    parameters: this.fb.array<RowFG>([]),
    hyperparameters: this.fb.array<HyperparameterFG>([]),
    returns: this.fb.array<ReturnFG>([]),
  });

  readonly formValid = toSignal(
    this.form.statusChanges.pipe(map(() => this.form.valid)),
    { initialValue: this.form.valid }
  );

  readonly isValid = computed(() => {
    const hyperOk = !this.isToolMode() || this.hyperParamValid;
    return this.formValid() && hyperOk;
  });

  readonly isToolMode = computed(() => !!this.selectedTool() && !this.function());
  readonly isFunctionMode = computed(() => !!this.function());
  readonly isPatientMode = computed(() => this.function()?.mode === FunctionExecutionMode.PATIENT);

  readonly usesMappings = computed(() => {
    const isFunctionMode = this.isFunctionMode();
    const isToolMode = this.isToolMode();
    if (isFunctionMode) {
      const mode = this.function()?.mode;
      return mode === FunctionExecutionMode.ROW || mode === FunctionExecutionMode.PATIENT;
    }
    if (isToolMode) {
      const tool = this.selectedTool();
      const inputs = tool?.appConfig?.input ?? [];
      const outputs = tool?.appConfig?.output ?? [];
      return !(inputs.some((p) => p.tabularSchema?.requiredColumns?.length === 1 &&
          p.tabularSchema?.requiredColumns?.includes("column")) &&
        outputs.some((p) => p.tabularSchema?.requiredColumns?.length === 1 &&
          p.tabularSchema?.requiredColumns?.includes("column")));
    }
    return false;
  });

  readonly returnKeys = computed(() => {
    const isFunctionMode = this.isFunctionMode();
    const isToolMode = this.isToolMode();
    if (isFunctionMode) {
      return this.function()?.returnKeys ?? [];
    }
    if (isToolMode) {
      const tool = this.selectedTool();
      const outputs = tool?.appConfig?.output ?? [];
      return outputs.flatMap(p => p.tabularSchema?.requiredColumns ?? []);
    }
    return [];
  });

  readonly inputKeys = computed(() => {
    const isFunctionMode = this.isFunctionMode();
    const isToolMode = this.isToolMode();
    if (isFunctionMode) {
      return (this.function()?.parameters ?? []).filter(parameter =>
        (parameter.usage ?? FunctionParameterUsage.INPUT) === FunctionParameterUsage.INPUT
      );
    }
    if (isToolMode) {
      const tool = this.selectedTool();
      const inputs = tool?.appConfig?.input ?? [];
      const inputColumns = inputs.flatMap(p => p.tabularSchema?.requiredColumns ?? []);
      return [{
        name: "column",
        keys: inputColumns
      } as FunctionParameterDTO];
    }
    return [];
  });

  readonly hyperparameterKeys = computed(() => {
    if (!this.isFunctionMode()) {
      return [];
    }
    return (this.function()?.parameters ?? []).filter(parameter =>
      parameter.usage === FunctionParameterUsage.HYPERPARAMETER
    );
  });

  readonly canEmit = computed(() => {
    if (this.isToolMode()) {
      return false;
    }
    return this.isFunctionMode() ? this.formValid() : false;
  });

  constructor() {
    effect(() => {
      const fn = this.function();
      const tool = this.selectedTool();
      const cols = this.columns();
      if (!fn && !tool) return;
      if (tool && (!cols || cols.length === 0)) return;

      this.createForm();
    });
    effect(() => {
      const fn = this.function();
      const m = this.mapping();

      const next = (m?.column ?? fn?.column) ?? '';
      if (next && this.selectedColumn() !== next) {
        this.selectedColumn.set(next);
        this.selectedColumns.set(next ? next.split(',') : []);
      }
    });

    effect(() => {
      if (!this.canEmit()) return;
      //this.mapping.set(this.buildDto());
    });
  }

  get parametersFormArray(): FormArray<RowFG> {
    return this.form.get('parameters') as FormArray<RowFG>;
  }

  get returnFormArray(): FormArray<ReturnFG> {
    return this.form.get('returns') as FormArray<ReturnFG>;
  }

  get hyperparametersFormArray(): FormArray<HyperparameterFG> {
    return this.form.get('hyperparameters') as FormArray<HyperparameterFG>;
  }

  onReturnColumnChange(row: ReturnFG): void {
    row.controls.value.setValue('', {emitEvent: false});
    row.controls.value.disable({emitEvent: false});
    row.controls.value.setErrors(null);
  }

  onReturnValueInput(row: ReturnFG): void {
    const val = row.controls.value;
    const col = row.controls.column;
    if (val.value) {
      col.setValue('', {emitEvent: false});
      col.disable({emitEvent: false});
      col.setErrors(null);
    } else {
      col.enable({emitEvent: false});
      col.updateValueAndValidity({emitEvent: false});
    }
  }

  clearReturnInput(row: ReturnFG, key: 'column' | 'value'): void {
    row.controls[key].setValue('', {emitEvent: false});
    row.controls.column.enable({emitEvent: false});
    row.controls.value.enable({emitEvent: false});
    if (key === 'column') {
      row.controls.value.setValue(row.controls.key.value, {emitEvent: false});
    }
    row.controls.value.updateValueAndValidity({emitEvent: false});
    this.clearError();
  }

  updateControlStates(row: RowFG): void {
    const col = row.controls.column;
    const val = row.controls.value;

    if (col.value && val.value) {
      val.setValue('', { emitEvent: false });
    }

    this.syncMutualExclusion(val, col);
    this.syncMutualExclusion(col, val);
  }

  private syncMutualExclusion(
    target: AbstractControl,
    driver: AbstractControl
  ): void {
    if (driver.value) {
      target.disable({ emitEvent: false });
      target.setErrors(null);
    } else {
      target.enable({ emitEvent: false });
      target.updateValueAndValidity({ emitEvent: false });
    }
  }

  createForm(): void {
    const returnKeys = this.returnKeys() ?? [];
    const inputParams = this.inputKeys() ?? [];
    const hyperparameterParams = this.hyperparameterKeys() ?? [];
    const inputMapping = this.mapping().inputMapping ?? {};
    const returnMapping = this.mapping().returnMapping ?? {};
    const hyperparams = this.mapping().hyperparams ?? {};

    const parameterGroups = inputParams.map(param =>
      this.buildParameterForm(param, param.name, inputMapping)
    );

    const returnGroups: ReturnFG[] = returnKeys.map(param => {
      let defaultValue = param;
      let defaultColumn = '';
      let disabledValue = false;

      const found = returnMapping[param];
      if (found) {
        if (this.columns().includes(found)) {
          defaultColumn = found;
          defaultValue = '';
          disabledValue = true;
        } else {
          defaultValue = found;
        }
      }

      const colCtrl = new FormControl<string>(
        {value: defaultColumn, disabled: false},
        {nonNullable: true}
      );

      const valCtrl = new FormControl<string>(
        {value: defaultValue, disabled: disabledValue},
        {
          nonNullable: true,
          validators: [Validators.required]
        }
      );

      return this.fb.group({
        key: new FormControl<string>(param, {nonNullable: true}),
        column: colCtrl,
        value: valCtrl,
        doc: new FormControl<string | null>(null),
      });
    });

    const hyperparameterGroups = hyperparameterParams.map(parameter =>
      this.buildHyperparameterForm(parameter, hyperparams)
    );

    const parametersArray = this.fb.array<RowFG>(parameterGroups);
    const hyperparametersArray = this.fb.array<HyperparameterFG>(hyperparameterGroups);
    const returnArray = this.fb.array<ReturnFG>(returnGroups);

    this.form.setControl('parameters', parametersArray);
    this.form.setControl('hyperparameters', hyperparametersArray);
    this.form.setControl('returns', returnArray);
  }

  private buildHyperparameterForm(
    parameter: FunctionParameterDTO,
    configured: Record<string, any>
  ): HyperparameterFG {
    const configuredValue = configured[parameter.name];
    const value = configuredValue ?? parameter.defaultValue ?? '';
    const validators = parameter.required ? [Validators.required] : [];

    return this.fb.group({
      key: new FormControl<string>(parameter.name, {nonNullable: true}),
      doc: new FormControl<string | null>(parameter.description ?? null),
      choices: new FormControl<string[]>(parameter.choices ?? [], {nonNullable: true}),
      value: new FormControl<string>(String(value), {nonNullable: true, validators}),
      type: new FormControl<string>(
        parameter.type ?? FunctionExecutionParameterType.STRING,
        {nonNullable: true}
      ),
    });
  }

  hasDescription(description: string | null | undefined): boolean {
    return !!description?.trim();
  }

  private getParameterDefaultValue(param: FunctionParameterDTO): string {
    return param.defaultValue ?? '';
  }

  private buildParameterForm(param: FunctionParameterDTO, key: string, inputMapping: { [key: string]: string }): RowFG {
    const paramDefaultValue = this.getParameterDefaultValue(param);
    let defaultValue = '';
    let defaultColumn = '';

    let disabledColumn = false;
    let disabledValue = false;
    const found = inputMapping[key];
    if (found) {
      if (this.columns().includes(found)) {
        defaultColumn = found
        disabledValue = true;
      } else {
        if (found.startsWith('[VALUE]')) {
          defaultValue = found.replace('[VALUE]', '');
        } else {
          defaultValue = found;
        }
        disabledColumn = true;
      }
    } else if (paramDefaultValue) {
      defaultValue = paramDefaultValue;
      disabledColumn = true;
    }
    const usesMappings = this.usesMappings();
    const colCtrl = new FormControl<string>({value: defaultColumn, disabled: disabledColumn}, {
      nonNullable: true,
      validators: usesMappings ? [Validators.required] : []
    });
    const valCtrl = new FormControl<string>({value: defaultValue, disabled: disabledValue}, {
      nonNullable: true,
      validators: [Validators.required]
    });

    const paramType = param.type ?? FunctionExecutionParameterType.STRING;

    if (paramType === FunctionExecutionParameterType.MAP) {
      let entries: { key: string; value: string }[] = [];
      try {
        const parsed = JSON.parse(defaultValue || '{}');
        entries = Object.entries(parsed).map(([k, v]) => ({key: k, value: String(v)}));
      } catch {
        entries = [];
      }
      if (entries.length === 0) {
        entries.push({key: '', value: ''});
      }
      this.mapEntries.set(key, entries);
    }

    const description = param.description?.trim() || null;

    return this.fb.group({
      functionName: new FormControl<string>(param.name, {nonNullable: true}),
      key: new FormControl<string>(key, {nonNullable: true}),
      choices: new FormControl<string[]>(param.choices || [], {nonNullable: true}),
      column: colCtrl,
      value: valCtrl,
      doc: new FormControl<string | null>(description),
      type: new FormControl<string>(paramType, {nonNullable: true}),
      defaultValue: new FormControl<string>(paramDefaultValue, {nonNullable: true}),
    });
  }

  getMapEntries(paramKey: string): { key: string; value: string }[] {
    return this.mapEntries.get(paramKey) ?? [];
  }

  addMapEntry(paramGroup: FormGroup): void {
    const key = paramGroup.get('key')?.value;
    const entries = this.mapEntries.get(key) ?? [];
    entries.push({key: '', value: ''});
    this.mapEntries.set(key, entries);
  }

  removeMapEntry(paramGroup: FormGroup, index: number): void {
    const key = paramGroup.get('key')?.value;
    const entries = this.mapEntries.get(key) ?? [];
    entries.splice(index, 1);
    this.mapEntries.set(key, entries);
    this.syncMapToValue(paramGroup);
  }

  updateMapEntry(paramGroup: FormGroup, index: number, field: 'key' | 'value', event: Event): void {
    const paramKey = paramGroup.get('key')?.value;
    const entries = this.mapEntries.get(paramKey) ?? [];
    if (entries[index]) {
      entries[index][field] = (event.target as HTMLInputElement).value;
      this.syncMapToValue(paramGroup);
    }
  }

  private syncMapToValue(paramGroup: FormGroup): void {
    const paramKey = paramGroup.get('key')?.value;
    const entries = this.mapEntries.get(paramKey) ?? [];
    const obj: Record<string, string> = {};
    for (const entry of entries) {
      if (entry.key.trim()) {
        obj[entry.key] = entry.value;
      }
    }
    const valueCtrl = paramGroup.get('value');
    if (valueCtrl) {
      valueCtrl.setValue(JSON.stringify(obj));
      this.updateControlStates(paramGroup);
    }
  }

  clearInput(paramGroup: FormGroup, key: string): void {
    const control = paramGroup.get(key);
    if (control) {
      if (key === 'value') {
        control.setValue(paramGroup.get('defaultValue')?.value ?? '');
      } else {
        control.setValue('');
      }
      this.updateControlStates(paramGroup);
      // Clear error when user makes changes
      this.clearError();
    }
  }

  clearError(): void {
    //this.errorMessage.set(null);
  }

  submit(): boolean {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity({emitEvent: true});

    if (!this.isValid()) return false;

    const dto = this.buildDto(this.form.getRawValue());
    this.mapping.set(dto);
    return true;
  }

  buildDto(input: any): AppTransformerMappings {
    const hyperparams: Record<string, any> = this.isToolMode() ? {...this.hyperParams} : {};
    const inputMapping: Record<string, string> = {};
    const returnMapping: Record<string, string> = {};
    let column = this.selectedColumns().join(',');
    input.parameters.forEach((param: any) => {
      if (param.key === "column") {
        column = param.value;
      } else {
        if (param.column) {
          inputMapping![param.key] = param.column;
        } else {
          inputMapping![param.key] = "[VALUE]" + param.value;
        }
      }
    });
    input.returns.forEach((param: any) => {
      returnMapping[param.key] = param.column || param.value;
    });
    input.hyperparameters.forEach((param: any) => {
      if (param.value === '' || param.value == null) {
        return;
      }
      hyperparams[param.key] = this.convertHyperparameterValue(param.value, param.type);
    });
    return {
      column: column.length > 0 ? column : undefined,
      hyperparams,
      inputMapping,
      returnMapping,
    };
  }

  private convertHyperparameterValue(value: string, type: FunctionExecutionParameterType): any {
    switch (type) {
      case FunctionExecutionParameterType.BOOLEAN:
        return String(value).toLowerCase() === 'true';
      case FunctionExecutionParameterType.INTEGER:
        return Number.parseInt(String(value), 10);
      case FunctionExecutionParameterType.DOUBLE:
        return Number.parseFloat(String(value));
      default:
        return value;
    }
  }
}

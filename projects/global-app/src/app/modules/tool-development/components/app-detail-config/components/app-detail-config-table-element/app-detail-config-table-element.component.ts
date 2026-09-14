import {Component, computed, effect, inject, model, signal, untracked} from '@angular/core';
import {
  ColumnRuleDTO,
  TabularSchemaDTO,
  ToolConfigHyperParamDataType
} from "@shared-lib/modules/app-execution/dto/config";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSelectModule} from "@angular/material/select";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {
  ConfigDataTypeOption,
  ConfigDataTypeSelectionArray,
  ConfigDataTypeSelectionOnlyNumberArray
} from "@shared-lib/modules/app-execution/model/config";
import {
  AppDetailConfigTablePreviewComponent
} from "../app-detail-config-table-preview/app-detail-config-table-preview.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";


type NullPolicyForm = FormGroup<{
  prohibitedEmptyCell: FormControl<boolean>;
  prohibitedEmptyString: FormControl<boolean>;
  prohibitedWhitespaceString: FormControl<boolean>;
  prohibitedNullLiterals: FormControl<boolean>;
  prohibitedNaN: FormControl<boolean>;
  prohibitedZeroAsNull: FormControl<boolean>;
  nullLiterals: FormControl<string[]>;
}>;

type ColumnRowForm = FormGroup<{
  key: FormControl<string>;
  required: FormControl<boolean>;
  type: FormControl<ToolConfigHyperParamDataType | null>;
  nullable: FormControl<boolean>;
  regex: FormControl<string | null>;
  enumValuesCsv: FormControl<string | null>;
  min: FormControl<number | null>;
  max: FormControl<number | null>;
  description: FormControl<string | null>;
}>;

type SchemaForm = FormGroup<{
  minRows: FormControl<number | null>;
  maxRows: FormControl<number | null>;
  minColumns: FormControl<number | null>;
  maxColumns: FormControl<number | null>;
  allowOnlyNumbers: FormControl<boolean | null>;
  prohibitedNulls: FormControl<boolean | null>;
  nullPolicy: NullPolicyForm;
  columns: FormArray<ColumnRowForm>;
}>;

@Component({
  selector: 'app-app-detail-config-table-element',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    AppDetailConfigTablePreviewComponent,
    ErrorCardComponent,
    HintCardComponent,
    MatCheckbox,
    MatChipsModule
  ],
  templateUrl: './app-detail-config-table-element.component.html',
  styleUrl: './app-detail-config-table-element.component.scss',
})
export class AppDetailConfigTableElementComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  schema = model<TabularSchemaDTO>({});

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  private readonly DEFAULT_NULL_LITERALS = ['null', 'none', 'na', 'n/a', 'nan'] as const;
  readonly nullLiteralChips = signal<string[]>([]);
  readonly nullLiteralQuery = signal<string>('');

  readonly form: SchemaForm = this.fb.group({
    minRows: this.fb.control<number | null>(null, this.nonNegativeNumber()),
    maxRows: this.fb.control<number | null>(null, this.nonNegativeNumber()),
    minColumns: this.fb.control<number | null>(null, this.nonNegativeNumber()),
    maxColumns: this.fb.control<number | null>(null, this.nonNegativeNumber()),
    allowOnlyNumbers: this.fb.control<boolean | null>(false),
    nullPolicy: this.createDefaultNullPolicyForm(),
    prohibitedNulls: this.fb.control<boolean | null>(false),
    columns: this.fb.array<ColumnRowForm>([]),
  });

  readonly columnsArray = computed(() => this.form.controls.columns);

  readonly hasDuplicateKeys = computed(() => {
    const keys = this.columnsArray().controls
      .map(c => c.controls.key.value?.trim())
      .filter(Boolean) as string[];
    return new Set(keys).size !== keys.length;
  });


  private schemaLoaded = false;

  constructor() {
    effect(() => {
      const s = this.schema();
      if (!this.schemaLoaded) {
        this.schemaLoaded = true;
        untracked(() => this.loadSchemaIntoForm(s));
      }
    });

    this.form.valueChanges.subscribe(() => {
      this.schema.set(this.toDto());
    });
  }

  addColumn() {
    const key = this.suggestNextColumnKey();
    this.columnsArray().push(this.createColumnRow(key));
    this.schema.set(this.toDto());
  }

  removeColumn(index: number) {
    this.columnsArray().removeAt(index);
    this.schema.set(this.toDto());
  }

  trackByIndex = (i: number) => i;
  readonly toolConfigDataTypes: ConfigDataTypeOption[] = ConfigDataTypeSelectionArray;
  readonly toolConfigDataTypesNumbers: ConfigDataTypeOption[] = ConfigDataTypeSelectionOnlyNumberArray;


  private loadSchemaIntoForm(schema: TabularSchemaDTO) {
    // Prevent noisy re-emits while patching
    this.form.patchValue(
      {
        minRows: schema.minRows ?? null,
        maxRows: schema.maxRows ?? null,
        minColumns: schema.minColumns ?? null,
        maxColumns: schema.maxColumns ?? null,
        allowOnlyNumbers: !!schema.allowOnlyNumbers,
        //allowNulls: schema.allowNulls ?? true,
      },
      {emitEvent: false}
    );

    // Rebuild columns
    const arr = this.columnsArray();
    while (arr.length) arr.removeAt(0, {emitEvent: false});

    const requiredSet = new Set(schema.requiredColumns ?? []);
    const columns = schema.columns ?? {};
    const keys = Object.keys(columns);

    for (const key of keys) {
      const rule = columns[key] ?? {};
      arr.push(
        this.createColumnRow(key, rule, requiredSet.has(key)),
        {emitEvent: false}
      );
    }
  }

  private createColumnRow(
    key: string,
    rule?: ColumnRuleDTO,
    required = false
  ): ColumnRowForm {
    return this.fb.group({
      key: this.fb.control<string>(key, {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[^\n\r,;]+$/)],
      }),
      required: this.fb.control<boolean>(required, {nonNullable: true}),
      type: this.fb.control<ToolConfigHyperParamDataType | null>(rule?.type ?? null),
      nullable: this.fb.control<boolean>(rule?.nullable ?? true, {nonNullable: true}),
      regex: this.fb.control<string | null>(rule?.regex ?? null),
      enumValuesCsv: this.fb.control<string | null>(
        rule?.enumValues?.length ? rule!.enumValues!.join(', ') : null
      ),
      min: this.fb.control<number | null>(rule?.min ?? null),
      max: this.fb.control<number | null>(rule?.max ?? null),
      description: this.fb.control<string | null>(null),
    });
  }

  createDefaultNullPolicyForm(): NullPolicyForm {
    return this.fb.group({
      prohibitedEmptyCell: this.fb.control(true, {nonNullable: true}),
      prohibitedEmptyString: this.fb.control(false, {nonNullable: true}),
      prohibitedWhitespaceString: this.fb.control(false, {nonNullable: true}),
      prohibitedNullLiterals: this.fb.control(true, {nonNullable: true}),
      prohibitedNaN: this.fb.control(true, {nonNullable: true}),
      prohibitedZeroAsNull: this.fb.control(false, {nonNullable: true}),
      nullLiterals: this.fb.control([...this.DEFAULT_NULL_LITERALS] as string[], {nonNullable: true}),
    });
  }

  private toDto(): TabularSchemaDTO {
    const v = this.form.getRawValue();

    const columns: Record<string, ColumnRuleDTO> = {};
    const requiredColumns: string[] = [];

    for (const row of v.columns) {
      const key = (row.key ?? '').trim();
      if (!key) continue;

      if (row.required) requiredColumns.push(key);

      const enumValues = this.parseCsv(row.enumValuesCsv);

      const rule: ColumnRuleDTO = {
        type: row.type ?? undefined,
        nullable: row.nullable,
        regex: row.regex ?? null,
        enumValues: enumValues,
        min: row.min ?? null,
        max: row.max ?? null,
        description: row.description ?? null,
      };

      if (!rule.enumValues?.length) rule.enumValues = null;

      columns[key] = rule;
    }
    const np = v.nullPolicy;

    return {
      minRows: v.minRows ?? null,
      maxRows: v.maxRows ?? null,
      minColumns: v.minColumns ?? null,
      maxColumns: v.maxColumns ?? null,
      allowOnlyNumbers: !!v.allowOnlyNumbers,
      nullPolicy: {
        prohibitedEmptyCell: np.prohibitedEmptyCell,
        prohibitedEmptyString: np.prohibitedEmptyString,
        prohibitedWhitespaceString: np.prohibitedWhitespaceString,
        prohibitedNullLiterals: np.prohibitedNullLiterals,
        prohibitedNaN: np.prohibitedNaN,
        prohibitedZeroAsNull: np.prohibitedZeroAsNull,
        nullLiterals: np.nullLiterals ?? [],
      },
      requiredColumns: requiredColumns.length ? requiredColumns : [],
      columns: Object.keys(columns).length ? columns : {},
    };
  }

  private parseCsv(csv: string | null): string[] | null {
    const s = (csv ?? '').trim();
    if (!s) return null;
    const parts = s
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    return parts.length ? parts : null;
  }

  private suggestNextColumnKey(): string {
    const existing = new Set(
      this.columnsArray().controls.map(c => c.controls.key.value.trim())
    );
    let i = 1;
    while (existing.has(`col_${i}`)) i++;
    return `col_${i}`;
  }

  private nonNegativeNumber() {
    return [
      (c: AbstractControl) => {
        const v = c.value;
        if (v === null || v === undefined || v === '') return null;
        return typeof v === 'number' && v >= 0 ? null : {nonNegative: true};
      },
    ];
  }

  private syncNullLiteralsToForm(values: string[]) {
    const clean = [...new Set(values.map(v => v.trim()).filter(Boolean))];
    this.nullLiteralChips.set(clean);
    this.form.controls.nullPolicy.controls.nullLiterals.setValue(clean);
  }

  removeNullLiteral(token: string) {
    const next = this.nullLiteralChips().filter(x => x !== token);
    this.syncNullLiteralsToForm(next);
  }

  addNullLiteralFromChipInput(event: MatChipInputEvent) {
    const value = (event.value ?? '').trim();
    if (!value) {
      event.chipInput?.clear();
      return;
    }

    const next = [...this.nullLiteralChips(), value];
    this.syncNullLiteralsToForm(next);

    event.chipInput?.clear();
    this.nullLiteralQuery.set('');
  }

  selectNullLiteral(optionValue: string) {
    const value = (optionValue ?? '').trim();
    if (!value) return;

    const next = [...this.nullLiteralChips(), value];
    this.syncNullLiteralsToForm(next);

    this.nullLiteralQuery.set('');
  }

  protected readonly Object = Object;
}

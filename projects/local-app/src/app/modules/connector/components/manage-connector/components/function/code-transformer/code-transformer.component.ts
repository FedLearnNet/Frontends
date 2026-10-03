import {
  afterNextRender,
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  linkedSignal,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize} from 'rxjs';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconButton} from '@angular/material/button';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatTooltip} from '@angular/material/tooltip';
import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {BadgeColor} from '@shared-lib/components/badge/badge.component';
import {ConsoleLogComponent} from '@shared-lib/modules/app-execution/components/console-log/console-log.component';
import {ConsoleStdOutDTO} from '@shared-lib/modules/app-execution/dto/console';
import {isAttributeNode, SchemaNodeNestedDto} from '@local-app/cohort/dto/schema';
import {FunctionExecutionMode} from '../../../../../dto/function';
import {
  CodeTransformerCheckResultDTO,
  CodeTransformerGoalDTO,
  CodeTransformerRunnerDTO,
  CodeTransformerRunnerStatus
} from '../../../../../dto/code-transformer';
import {
  DataTypeDto,
  DataTypeTypeEnum,
  DataTypeValidationDto,
  DataTypeValidationNameEnum
} from '../../../../../../cohort/dto/data-type';
import {ConnectorCodeTransformerService} from '../../../../../services/connector-code-transformer.service';
import {modeIcon, modeLabelKey} from '../tool-list-item/transformer-mode';

const HEADER = [
  'from pyfedappwrap.transformation.base_transformer import BaseTransformerAPP',
  'class CodeTransformer(BaseTransformerAPP):',
];
const SIGNATURES: Record<FunctionExecutionMode, string> = {
  [FunctionExecutionMode.CELL]: '    def transform(self, value):',
  [FunctionExecutionMode.ROW]: '    def transform(self, row: dict):',
  [FunctionExecutionMode.PATIENT]: '    def transform(self, rows: list[dict]):',
};
const STARTERS: Record<FunctionExecutionMode, string> = {
  [FunctionExecutionMode.CELL]: '        return value',
  [FunctionExecutionMode.ROW]: '        return row',
  [FunctionExecutionMode.PATIENT]: '        return rows',
};
const BODY_LINE = HEADER.length + 1;
const V = DataTypeValidationNameEnum;
const RULES: Partial<Record<DataTypeTypeEnum, DataTypeValidationNameEnum[]>> = {
  [DataTypeTypeEnum.STRING]: [V.MINLENGTH, V.MAXLENGTH, V.PATTERN],
  [DataTypeTypeEnum.INT]: [V.MIN, V.MAX],
  [DataTypeTypeEnum.FLOAT]: [V.MIN, V.MAX],
  [DataTypeTypeEnum.DATE]: [V.MIN, V.MAX],
  [DataTypeTypeEnum.DATE_TIME]: [V.MIN, V.MAX],
};

const RUNNER_COLORS: Record<CodeTransformerRunnerStatus, BadgeColor> = {
  [CodeTransformerRunnerStatus.STOPPED]: 'GRAY',
  [CodeTransformerRunnerStatus.STARTING]: 'ORANGE',
  [CodeTransformerRunnerStatus.RUNNING]: 'GREEN',
  [CodeTransformerRunnerStatus.FAILED]: 'RED',
};

interface SchemaGoal {
  label: string;
  key: string;
  dataType: DataTypeDto;
}

const toKey = (name?: string | null): string => (name ?? '').toLocaleLowerCase().replace(/[^a-z0-9]/g, '');

function schemaGoals(nodes: SchemaNodeNestedDto[], path: string[] = []): SchemaGoal[] {
  return nodes.flatMap(node => isAttributeNode(node)
    ? [{label: [...path, node.name].join(' > '), key: toKey(node.name), dataType: node.dataType}]
    : schemaGoals(node.childNodes ?? [], [...path, node.name]));
}

@Component({
  selector: 'app-code-transformer',
  imports: [
    TranslatePipe,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggle,
    MatButtonToggleModule,
    MatIconButton,
    MatAutocompleteModule,
    MatTooltip,
    ConsoleLogComponent,
    BtnComponent,
    BadgeComponent,
    ErrorCardComponent,
  ],
  templateUrl: './code-transformer.component.html',
  styleUrl: './code-transformer.component.scss',
})
export class CodeTransformerComponent implements OnInit, AfterViewInit {
  private readonly service = inject(ConnectorCodeTransformerService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly editorHost = viewChild.required<ElementRef<HTMLElement>>('editor');
  private readonly resultHost = viewChild<ElementRef<HTMLElement>>('result');
  private editor?: CodeMirror.Editor;

  columns = input<string[]>([]);
  rows = input<Record<string, unknown>[]>([]);
  schema = input<SchemaNodeNestedDto[]>([]);

  readonly modes = Object.values(FunctionExecutionMode);
  readonly types = Object.values(DataTypeTypeEnum);
  readonly modeIcon = modeIcon;
  readonly modeLabelKey = modeLabelKey;

  readonly mode = signal(FunctionExecutionMode.CELL);
  readonly selectedColumns = linkedSignal(() => this.columns().slice(0, 1));
  readonly inputType = signal(DataTypeTypeEnum.STRING);
  readonly generated = linkedSignal(() => !this.rows().length);
  readonly body = signal(STARTERS[FunctionExecutionMode.CELL]);
  readonly running = signal(false);
  readonly result = signal<CodeTransformerCheckResultDTO | null>(null);
  readonly runner = signal<CodeTransformerRunnerDTO>({status: CodeTransformerRunnerStatus.STOPPED});
  readonly runnerReady = computed(() => this.runner().status === CodeTransformerRunnerStatus.RUNNING);
  readonly runnerBusy = computed(() => this.runner().status === CodeTransformerRunnerStatus.STARTING);
  readonly runnerColor = computed(() => RUNNER_COLORS[this.runner().status]);
  readonly logs = signal<ConsoleStdOutDTO[]>([]);
  readonly logsConnected = signal(false);

  readonly schemaGoals = computed(() => schemaGoals(this.schema()));
  readonly fromSchema = linkedSignal(() => !!this.schemaGoals().length);
  readonly schemaGoal = linkedSignal<SchemaGoal | null>(() => {
    const column = toKey(this.inputColumns()[0]);
    return this.schemaGoals().find(goal => goal.key === column) ?? this.schemaGoals()[0] ?? null;
  });
  readonly goalSearch = linkedSignal(() => this.schemaGoal()?.label ?? '');
  readonly filteredGoals = computed(() => {
    const query = this.goalSearch().trim().toLocaleLowerCase();
    return query === this.schemaGoal()?.label.toLocaleLowerCase() ? this.schemaGoals()
      : this.schemaGoals().filter(g => `${g.label} ${g.dataType.type}`.toLocaleLowerCase().includes(query));
  });
  readonly goalLabel = (goal: SchemaGoal | null): string => goal?.label ?? '';
  readonly goalType = signal(DataTypeTypeEnum.STRING);
  readonly rules = signal<DataTypeValidationDto[]>([]);
  readonly required = signal(false);
  readonly ruleNames = computed(() => RULES[this.goalType()] ?? []);

  readonly goal = computed<CodeTransformerGoalDTO | null>(() => {
    if (!this.fromSchema()) {
      return {
        type: this.goalType(),
        validations: this.rules().filter(rule => rule.validator?.trim()),
        isRequired: this.required(),
        allowNullValues: !this.required(),
      };
    }
    const dataType = this.schemaGoal()?.dataType;
    return dataType ? {
      type: dataType.type,
      validations: dataType.validations ?? [],
      options: (dataType.options ?? []).map(option => String(option.value)),
      isRequired: !!dataType.isRequired,
      allowNullValues: dataType.allowNullValues ?? true,
    } : null;
  });

  readonly errorGroups = computed(() => Object.entries((this.result()?.samples ?? [])
    .filter(sample => sample.error)
    .reduce<Record<string, number>>((groups, sample) => ({...groups, [sample.error!]: (groups[sample.error!] ?? 0) + 1}), {})));
  readonly isCell = computed(() => this.mode() === FunctionExecutionMode.CELL);
  readonly inputColumns = computed(() => this.isCell() ? this.selectedColumns() : this.columns());
  readonly canCheck = computed(() =>
    !this.running() && this.runnerReady() && !!this.goal() && !!this.inputColumns().length && !!this.body().trim());

  ngOnInit(): void {
    this.startRunner();
    this.service.runnerLogs().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: log => {
        this.logsConnected.set(true);
        this.logs.update(logs => [...logs, {msg: `${new Date(log.time).toLocaleTimeString()}  ${log.message}`}]);
      },
      error: () => this.logsConnected.set(false),
      complete: () => this.logsConnected.set(false),
    });
  }

  ngAfterViewInit(): void {
    const run = () => {
      if (this.canCheck()) {
        this.check();
      }
    };
    this.editor = CodeMirror(this.editorHost().nativeElement, {
      mode: 'python',
      lineNumbers: true,
      indentUnit: 4,
      viewportMargin: Infinity,
      extraKeys: {'Ctrl-Enter': run, 'Cmd-Enter': run},
    });
    this.editor.on('change', editor => this.body.set(editor.getRange({line: BODY_LINE, ch: 0}, {line: editor.lineCount(), ch: 0})));
    this.showSource();
    const resize = new ResizeObserver(() => this.editor?.refresh());
    resize.observe(this.editorHost().nativeElement);
    this.destroyRef.onDestroy(() => resize.disconnect());
  }

  format(value: unknown): string {
    return value === null || value === undefined ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  setMode(mode: FunctionExecutionMode): void {
    const keepBody = this.body().trim() !== STARTERS[this.mode()].trim();
    this.mode.set(mode);
    this.showSource(keepBody ? this.body() : STARTERS[mode]);
  }

  startRunner(): void {
    this.runner.update(runner => ({...runner, status: CodeTransformerRunnerStatus.STARTING, error: null}));
    this.service.startRunner().subscribe({
      next: runner => this.runner.set(runner),
      error: err => this.runner.update(runner => ({
        ...runner,
        status: CodeTransformerRunnerStatus.FAILED,
        error: err?.error?.detail ?? err?.message ?? this.translate.instant('CODE_TRANSFORMER.RUNNER_FAILED'),
      })),
    });
  }

  stopRunner(): void {
    this.service.stopRunner().subscribe(runner => this.runner.set(runner));
  }

  selectGoal(goal: SchemaGoal): void {
    this.schemaGoal.set(goal);
    this.goalSearch.set(goal.label);
  }

  setGoalType(type: DataTypeTypeEnum): void {
    this.goalType.set(type);
    this.rules.set([]);
  }

  addRule(): void {
    this.rules.update(rules => [...rules, {name: this.ruleNames()[0], validator: ''}]);
  }

  updateRule(index: number, rule: Partial<DataTypeValidationDto>): void {
    this.rules.update(rules => rules.map((r, i) => i === index ? {...r, ...rule} : r));
  }

  removeRule(index: number): void {
    this.rules.update(rules => rules.filter((_, i) => i !== index));
  }

  check(): void {
    const columns = this.inputColumns();
    this.running.set(true);
    this.result.set(null);
    this.service.check({
      body: this.body(),
      mode: this.mode(),
      goal: this.goal()!,
      sourceGoals: this.generated() ? Object.fromEntries(columns.map(c => [c, {type: this.inputType()}])) : null,
      data: this.generated() ? null : Object.fromEntries(columns.map(c => [c, this.rows().map(row => row[c] ?? null)])),
    }).pipe(finalize(() => this.running.set(false))).subscribe({
      next: result => {
        this.result.set(result);
        afterNextRender(() => this.resultHost()?.nativeElement.scrollIntoView({behavior: 'smooth', block: 'nearest'}),
          {injector: this.injector});
      },
      error: err => this.result.set({
        isSuccess: false,
        message: err?.error?.detail ?? err?.message ?? this.translate.instant('CODE_TRANSFORMER.FAILED'),
        inputKeys: [],
        returnKeys: [],
      }),
    });
  }

  private showSource(body = this.body()): void {
    const editor = this.editor!;
    editor.setValue([...HEADER, SIGNATURES[this.mode()], body].join('\n'));
    editor.markText({line: 0, ch: 0}, {line: BODY_LINE, ch: 0},
      {readOnly: true, inclusiveLeft: true, className: 'code-transformer__readonly'});
    HEADER.concat(SIGNATURES[this.mode()]).forEach((_, line) => editor.addLineClass(line, 'background', 'code-transformer__locked'));
    editor.setCursor(editor.lineCount(), 0);
    editor.focus();
  }
}

import {Component, computed, effect, inject, OnInit, signal, untracked} from '@angular/core';
import {KeyValuePipe, Location, NgTemplateOutlet} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {finalize, forkJoin, Observable, switchMap} from 'rxjs';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatProgressBar} from '@angular/material/progress-bar';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {DataTypeTypeEnum} from '../../../cohort/dto/data-type';
import {ConnectorDTO, ConnectorMappingDTO, ConnectorTransformerDTO} from '../../../connector/dto/connector';
import {ConnectorFilesDetailDTO} from '../../../connector/dto/upload-info';
import {FunctionExecutionMode, FunctionsDetailDTO} from '../../../connector/dto/function';
import {FunctionService} from '../../../connector/services/function.service';
import {TOOLS_TRANSFORMER_MODULE} from '../../../connector/constansts/tools-transformer-module.constants';
import {
  ConnectorTransformerFunctionManagerComponent,
  TransformerDialogData
} from '../../../connector/components/manage-connector/components/function/transformer-manager/transformer-manager.component';
import {ConnectorCard} from '../../../connector/models/connector-card';
import {
  TransformerAssistantComponent
} from '../../../connector/components/manage-connector/components/transformer-assistant/transformer-assistant.component';
import {ConnectorStepCardsComponent} from '../../../connector/components/manage-connector/components/cards/cards.component';
import {
  ConnectorDynamicTableComponent
} from '../../../connector/components/manage-connector/components/table/dynamic-table/dynamic-table.component';
import {HarmonizationDTO, HarmonizationResultDTO, HarmonizationTargetDTO} from '../../dto/harmonization';
import {HarmonizationService} from '../../services/harmonization.service';

type FileField = 'referenceFileId' | 'sourceFileId';
type Field = FileField | 'referenceKey' | 'sourceKey';
type Step = 'REFERENCE' | 'SOURCE' | 'TRANSFORM' | 'MAPPING' | 'RESULT';

/** The steps of a harmonization, laid out like the steps of a connector: every step shows its preview rows. */
@Component({
  selector: 'app-harmonization-edit',
  templateUrl: './harmonization-edit.component.html',
  styleUrl: './harmonization-edit.component.scss',
  imports: [
    KeyValuePipe,
    NgTemplateOutlet,
    FormsModule,
    TranslatePipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIcon,
    MatProgressBar,
    CdkDropList,
    CdkDrag,
    HeaderComponent,
    BtnComponent,
    BadgeComponent,
    TransformerAssistantComponent,
    ConnectorStepCardsComponent,
    ConnectorDynamicTableComponent,
  ],
})
export class HarmonizationEditComponent implements OnInit {
  private readonly service = inject(HarmonizationService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly functionService = inject(FunctionService);
  private readonly dialog = inject(MatDialog);

  readonly types = Object.values(DataTypeTypeEnum).filter(type => type !== DataTypeTypeEnum.FILE);
  readonly harmonization = signal<HarmonizationDTO>({name: '', targets: [], transformer: [], mapping: []});
  readonly files = signal<ConnectorFilesDetailDTO[]>([]);
  readonly result = signal<HarmonizationResultDTO | null>(null);
  readonly preview = signal<Record<string, unknown>[]>([]);
  readonly harmonizedPreview = signal<HarmonizationResultDTO | null>(null);
  readonly previewLoading = signal(false);
  readonly assistantOpen = signal(false);
  readonly busy = signal(false);
  /** Changed since it was loaded or saved last. */
  readonly dirty = signal(false);
  readonly functions = signal<FunctionsDetailDTO[]>([TOOLS_TRANSFORMER_MODULE]);
  readonly targetsLoading = signal(false);
  /** Index of the selected step in the cards. */
  readonly selected = signal(0);
  /** The assistant of a harmonization builds the connector of the source file itself. */
  readonly assistantConnector = {} as ConnectorDTO;

  readonly referenceColumns = computed(() => columnsOf(this.file('referenceFileId')));
  readonly sourceRows = computed(() => rowsOf(this.file('sourceFileId')));
  /** The columns of the source file and the ones its transformers write, which a target can be mapped from. */
  readonly sourceColumns = computed(() => [...new Set([
    ...columnsOf(this.file('sourceFileId')),
    ...this.harmonization().transformer.flatMap(outputColumns),
  ])]);
  readonly mapped = computed(() => new Map(this.harmonization().mapping.map(mapping => [mapping.mapping, mapping.column])));
  readonly assistantPath = computed(() => this.service.assistantPath(this.harmonization().id ?? 0));
  readonly rejected = computed(() => Object.entries((this.harmonizedPreview() ?? this.result())?.rejected ?? {}));
  /** Used when no name is entered, so a name never blocks the mapping. */
  readonly defaultName = computed(() => [this.file('sourceFileId'), this.file('referenceFileId')]
    .filter(file => !!file).map(file => file!.fileName).join(' → '));
  /** What is still missing before the source can be mapped, shown next to the disabled buttons. */
  readonly missing = computed(() => {
    const harmonization = this.harmonization();
    if (!harmonization.targets.length) {
      return 'HARMONIZATION.MISSING_REFERENCE';
    }
    return harmonization.sourceFileId && harmonization.sourceKey ? null : 'HARMONIZATION.MISSING_SOURCE';
  });
  readonly filter = signal('');
  readonly shownTargets = computed(() => {
    const filter = this.filter().toLowerCase();
    return this.harmonization().targets.map((target, index) => ({target, index}))
      .filter(({target}) => (target.name + ' ' + (target.dataType.description ?? '')).toLowerCase().includes(filter));
  });

  /** Reference, source, one card per transformer, mapping with the join and the result, like the connector steps. */
  readonly cards = computed<(ConnectorCard & { kind: Step, transformer?: FunctionsDetailDTO })[]>(() => {
    const harmonization = this.harmonization();
    const card = (kind: Step, title: string, configured: boolean, extra: Partial<ConnectorCard> = {}) =>
      ({kind, title: this.translate.instant(title), configured, step: kind, type: 'CONFIG' as const, index: 0, ...extra});
    const summary = (field: FileField, key?: string) => [this.file(field)?.fileName, key].filter(Boolean).join(' · ');
    const statics = harmonization.targets.filter(target => target.staticColumn).length;
    return [
      card('REFERENCE', 'HARMONIZATION.REFERENCE', harmonization.targets.length > 0, {content: summary('referenceFileId',
          harmonization.targets.length ? this.translate.instant('HARMONIZATION.COLUMNS', {count: harmonization.targets.length, statics}) : undefined)}),
      card('SOURCE', 'HARMONIZATION.SOURCE', !!harmonization.sourceFileId && !!harmonization.sourceKey,
        {content: summary('sourceFileId', harmonization.sourceKey)}),
      ...harmonization.transformer.map(transformer =>
        ({...card('TRANSFORM', transformer.methodName ?? 'TRANSFORMER', true, {type: 'TRANSFORM', optional: true}),
          transformer: this.withFunctionDetails(transformer)})),
      card('MAPPING', 'HARMONIZATION.MAPPING', harmonization.mapping.length > 0, {type: 'MAPPING', upcoming: !!this.missing(),
        content: harmonization.mapping.length ? this.translate.instant('HARMONIZATION.MAPPED',
          {mapped: harmonization.mapping.length, count: harmonization.targets.length}) : undefined}),
      card('RESULT', 'HARMONIZATION.RESULT', !!this.result(), {upcoming: !harmonization.mapping.length}),
    ].map((step, index) => ({...step, index}));
  });
  readonly step = computed(() => this.cards()[Math.min(this.selected(), this.cards().length - 1)]);
  /** Changes only when another step is selected, not with every edit of the harmonization. */
  private readonly stepKey = computed(() => this.step().kind + ':' + this.selected());
  /** Index of the selected transformer, its preview shows the rows after it. */
  readonly transformerIndex = computed(() => this.selected() - 2);

  constructor() {
    // Every step loads the preview rows it shows, like the steps of a connector
    effect(() => {
      this.stepKey();
      untracked(() => this.loadPreview(this.step().kind));
    });
  }

  ngOnInit(): void {
    this.service.files().subscribe(files => this.files.set(files));
    this.functionService.getAllFunctionsDetails().subscribe(functions => this.functions.update(loaded => [...loaded, ...functions]));
    const id = Number(this.route.snapshot.paramMap.get('harmonizationId'));
    if (id) {
      this.service.get(id).subscribe(harmonization => {
        this.harmonization.set(harmonization);
        this.loadPreview(this.step().kind);
      });
      // The assistant runs on in the background, after a reload it is followed again
      this.service.assistantRunning(id).subscribe(running => this.assistantOpen.set(running));
    }
  }

  select(index: number): void {
    if (!this.cards()[index].upcoming) {
      this.selected.set(index);
    }
  }

  update(patch: Partial<HarmonizationDTO>): void {
    this.harmonization.update(harmonization => ({...harmonization, ...patch}));
    this.dirty.set(true);
  }

  value(field: Field): number | string | undefined {
    return this.harmonization()[field];
  }

  /** A new file keeps its key column if it has one of that name, the reference key is tried for the source. */
  set(field: Field, value: number | string): void {
    if (this.value(field) === value) {
      return;
    }
    const patch: Partial<HarmonizationDTO> = {[field]: value};
    // A name the user did not enter follows the files
    const named = !!this.harmonization().name && this.harmonization().name !== this.defaultName();
    if (field === 'referenceFileId' || field === 'sourceFileId') {
      const key = field === 'referenceFileId' ? 'referenceKey' : 'sourceKey';
      const columns = columnsOf(this.files().find(file => file.id === value));
      const current = this.harmonization()[key] ?? this.harmonization().referenceKey;
      patch[key] = current && columns.includes(current) ? current : undefined;
    }
    this.update(patch);
    if (!named) {
      this.update({name: this.defaultName()});
    }
    if (field.startsWith('reference')) {
      this.loadTargets();
    }
    this.loadPreview(this.step().kind);
  }

  upload(event: Event, field: FileField): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    this.busy.set(true);
    this.service.upload(file).pipe(finalize(() => this.busy.set(false))).subscribe(uploaded => {
      this.files.update(files => [uploaded, ...files]);
      this.set(field, uploaded.id);
    });
  }

  /** The targets of another reference file or key belong to other indexes, so the mapping starts over. */
  private loadTargets(): void {
    const {referenceFileId, referenceKey} = this.harmonization();
    this.update({targets: [], transformer: [], mapping: []});
    if (!referenceFileId || !referenceKey) {
      return;
    }
    this.targetsLoading.set(true);
    this.service.targets(referenceFileId, referenceKey).pipe(finalize(() => this.targetsLoading.set(false)))
      .subscribe(targets => this.update({targets}));
  }

  updateTarget(index: number, patch: Partial<HarmonizationTargetDTO>): void {
    this.update({targets: this.harmonization().targets.map((target, i) => i === index ? {...target, ...patch} : target)});
  }

  setType(index: number, type: DataTypeTypeEnum): void {
    this.updateTarget(index, {dataType: {...this.harmonization().targets[index].dataType, type}});
  }

  setAllowedValues(index: number, text: string): void {
    const allowedValues = text.split(',').map(value => value.trim()).filter(Boolean);
    this.updateTarget(index, {dataType: {...this.harmonization().targets[index].dataType, allowedValues}});
  }

  setColumn(index: number, column: string | null): void {
    const target = this.harmonization().targets[index].name;
    const mapping = this.harmonization().mapping.filter(m => m.mapping !== target);
    // Same ids as the backend gives the targets when the assistant maps them
    this.update({mapping: column ? [...mapping, {column, mapping: target, schemaId: -(index + 1)}] : mapping});
    this.loadPreview('MAPPING');
  }

  removeTransformer(index: number): void {
    this.update({transformer: this.harmonization().transformer.filter((_, i) => i !== index)});
    this.selected.set(1);
  }

  /** Edits a transformer, or adds one at the end, with the dialog of the connector on the rows before it. */
  editTransformer(index = this.harmonization().transformer.length): void {
    const current = this.harmonization().transformer[index];
    this.track(this.service.previewTransformed(this.harmonization(), index), rows => {
      const data: TransformerDialogData = {
        functions: this.functions(),
        columns: rows.length ? Object.keys(rows[0]) : this.sourceColumns(),
        rows,
        patientIdColumn: this.harmonization().sourceKey,
        data: current && this.withFunctionDetails(current),
      };
      this.dialog.open(ConnectorTransformerFunctionManagerComponent, {
        minWidth: 'min(900px, 94vw)', height: '84vh', width: '80vw', maxWidth: '1440px', maxHeight: '94vh', autoFocus: false, data,
      }).afterClosed().subscribe((result?: FunctionsDetailDTO | { delete: boolean }) => {
        if (!result) {
          return;
        }
        if ('delete' in result) {
          this.removeTransformer(index);
          return;
        }
        const transformer = [...this.harmonization().transformer];
        transformer.splice(index, current ? 1 : 0, toTransformer(result));
        this.update({transformer});
        this.selectTransformer(index);
      });
    });
  }

  /** Reorders the transformers like the drag and drop of the connector steps. */
  dropTransformer(event: CdkDragDrop<unknown>): void {
    const transformer = [...this.harmonization().transformer];
    moveItemInArray(transformer, event.previousIndex, event.currentIndex);
    this.update({transformer});
    this.selectTransformer(event.currentIndex);
  }

  private selectTransformer(index: number): void {
    const selected = this.selected() === index + 2;
    this.selected.set(index + 2);
    if (selected) {
      // The same step stays selected, so its preview is not loaded again by itself
      this.loadPreview('TRANSFORM');
    }
  }

  save(then?: () => void): void {
    this.busy.set(true);
    this.service.save(this.named()).pipe(finalize(() => this.busy.set(false))).subscribe(saved => {
      if (!this.harmonization().id) {
        // Only the URL changes, so an assistant opened right after saving stays open
        this.location.replaceState(this.router.createUrlTree(['..', saved.id], {relativeTo: this.route}).toString());
      }
      this.harmonization.set(saved);
      this.dirty.set(false);
      then?.();
    });
  }

  openAssistant(): void {
    this.save(() => this.assistantOpen.set(true));
  }

  onAssistantApplied(patch: ConnectorDTO): void {
    this.assistantOpen.set(false);
    const mappings = (patch.schemaMapping ?? []) as ConnectorMappingDTO[];
    const targets = new Set(mappings.map(mapping => mapping.mapping));
    this.update({
      transformer: [...this.harmonization().transformer, ...(patch.transformer ?? []) as ConnectorTransformerDTO[]],
      mapping: [...this.harmonization().mapping.filter(mapping => !targets.has(mapping.mapping)), ...mappings],
    });
    this.save(() => this.selected.set(this.cards().findIndex(card => card.kind === 'MAPPING')));
  }

  run(): void {
    this.busy.set(true);
    this.service.save(this.named()).pipe(
      switchMap(saved => this.service.run(saved.id!)),
      finalize(() => this.busy.set(false)),
    ).subscribe(result => {
      this.result.set(result);
      // Saved before the run, the output file is stored by it
      this.harmonization.update(harmonization => ({...harmonization, outputFileId: result.outputFileId}));
      this.dirty.set(false);
      this.selected.set(this.cards().length - 1);
      this.service.files().subscribe(files => this.files.set(files));
    });
  }

  download(fileId: number): void {
    this.service.download(fileId).subscribe(link => link.click());
  }

  /** The definition of its function next to the transformer, like the steps of a connector show it. */
  private withFunctionDetails(transformer: ConnectorTransformerDTO): FunctionsDetailDTO {
    const definition = this.functions().find(candidate =>
      candidate.moduleName === transformer.moduleName && candidate.methodName === transformer.methodName);
    return {
      ...definition,
      ...transformer,
      moduleName: transformer.moduleName ?? definition?.moduleName ?? '',
      methodName: transformer.methodName ?? definition?.methodName ?? '',
      mode: definition?.mode ?? transformer.mode ?? FunctionExecutionMode.CELL,
      appVersionId: transformer.appVersionId == null ? null : Number(transformer.appVersionId),
      parameters: definition?.parameters ?? [],
      returnKeys: definition?.returnKeys ?? [],
    };
  }

  private named(): HarmonizationDTO {
    return {...this.harmonization(), name: this.harmonization().name || this.defaultName()};
  }

  private loadPreview(step: Step): void {
    const harmonization = this.harmonization();
    if (step === 'REFERENCE' && harmonization.referenceFileId) {
      this.track(this.service.sample(harmonization.referenceFileId), rows => this.preview.set(rows));
    } else if (step === 'SOURCE') {
      this.preview.set(this.sourceRows());
    } else if (step === 'TRANSFORM' && harmonization.sourceFileId) {
      // Like the step preview of a connector: the columns of the step before and after it, next to the key
      const steps = this.transformerIndex() + 1;
      const columns = [harmonization.sourceKey, ...touchedColumns(harmonization.transformer[steps - 1])]
        .filter((column): column is string => !!column);
      this.track(forkJoin([this.service.previewTransformed(harmonization, steps - 1), this.service.previewTransformed(harmonization, steps)]),
        ([before, after]) => this.preview.set(after.map((row, index) => Object.fromEntries(columns.flatMap(column =>
          column === harmonization.sourceKey ? [[column, row[column]]] : [
            [this.translate.instant('HARMONIZATION.BEFORE', {column}), before[index]?.[column]],
            [column, row[column]],
          ])))));
    } else if (step === 'MAPPING' && harmonization.sourceFileId && harmonization.referenceFileId) {
      this.track(this.service.previewHarmonized(harmonization), result => {
        this.harmonizedPreview.set(result);
        this.preview.set(result.preview);
      });
    } else if (step === 'RESULT') {
      this.preview.set(this.result()?.preview ?? []);
    } else {
      this.preview.set([]);
    }
  }

  private track<T>(request: Observable<T>, next: (value: T) => void): void {
    this.previewLoading.set(true);
    request.pipe(finalize(() => this.previewLoading.set(false))).subscribe(next);
  }

  private file(field: FileField): ConnectorFilesDetailDTO | undefined {
    const id = this.harmonization()[field];
    return this.files().find(file => file.id === id);
  }
}

function columnsOf(file?: ConnectorFilesDetailDTO): string[] {
  return file?.uploadInfo?.[0]?.columns ?? [];
}

function rowsOf(file?: ConnectorFilesDetailDTO): Record<string, unknown>[] {
  try {
    const rows = JSON.parse(file?.uploadInfo?.[0]?.json ?? '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

/** The columns a transformer reads or writes, its input columns are mapped without the [VALUE] of a literal. */
function touchedColumns(transformer: ConnectorTransformerDTO): string[] {
  const inputs = Object.values(transformer.inputMapping ?? {})
    .filter((value): value is string => typeof value === 'string' && !value.startsWith('[VALUE]'));
  const cells = (transformer.column ?? '').split(',').map(column => column.trim()).filter(Boolean);
  return [...new Set([...cells, ...inputs, ...outputColumns(transformer)])];
}

/** Only what a connector stores of a transformer, not the definition of its function. */
function toTransformer(fn: FunctionsDetailDTO): ConnectorTransformerDTO {
  const {moduleName, methodName, mode, inputMapping, returnMapping, column, hyperparams, appVersionId, appImage} = fn;
  return {moduleName, methodName, mode, inputMapping, returnMapping, column, hyperparams, appVersionId, appImage} as ConnectorTransformerDTO;
}

function outputColumns(transformer: ConnectorTransformerDTO): string[] {
  return Object.values(transformer.returnMapping ?? {}).filter((column): column is string => typeof column === 'string');
}

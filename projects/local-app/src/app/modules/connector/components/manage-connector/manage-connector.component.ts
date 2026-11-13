import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import {ConnectorCard} from "../../models/connector-card";
import {ConnectorStepConfigs} from "../../enum/connector-step-config";
import {ConnectorStepConfigChangeEmitter} from "../../models/connector-step-config";
import {configToCards, configToConnectorDraft, connectorDraftToConfig} from "../../models/connector-config";
import {ConnectorStepConfigComponent} from "./components/config/config.component";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import {cloneDeep, random} from "lodash";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  ConnectorTransformerFunctionManagerComponent
} from "./components/function/transformer-manager/transformer-manager.component";
import {
  TransformationOverviewDialogComponent,
  TransformationOverviewDialogData
} from "./components/function/transformation-overview-dialog/transformation-overview-dialog.component";
import {FunctionService} from "../../services/function.service";
import {FunctionExecutionMode, FunctionsDetailDTO} from "../../dto/function";
import {
  AppBasedTransformerComponent
} from './components/function/app-based-transformer/app-based-transformer.component';
import {PreviewStageDTO} from "../../dto/preview";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";
import {
  PreviewCacheDialogComponent,
  PreviewCacheDialogData,
  PreviewCacheDialogResult
} from "./components/preview-cache-dialog/preview-cache-dialog.component";
import {ConnectorPreviewService} from "../../services/connector-preview.service";
import {ConnectorMappingConfig} from "../../models/connector-model";
import {ManageConnectorSaveDialogComponent} from "./components/save-dialog/save-dialog.component";
import {ConnectorService} from "../../services/connector-crud.service";
import {ActivatedRoute, Data, Router} from "@angular/router";
import {ConnectorManagementMode} from "../../enum/connector-managment-mode";
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {map, take} from 'rxjs';
import {MatDrawer, MatDrawerContainer, MatDrawerContent} from '@angular/material/sidenav';
import {ConnectorStepCardsComponent} from './components/cards/cards.component';
import {MatDivider} from '@angular/material/divider';
import {ConnectorDynamicTableComponent} from './components/table/dynamic-table/dynamic-table.component';
import {ConnectorEditMapperComponent} from './components/mapper/edit-mapper/edit-mapper.component';
import {MatToolbar} from '@angular/material/toolbar';
import {TOOLS_TRANSFORMER_MODULE} from '../../constansts/tools-transformer-module.constants';
import {ConnectorUploadService} from '../../services/connector-upload.service';
import {UploadInfoDTO} from '../../dto/upload-info';
import {getPrimarySheet, hasValidFileInfo, setMissingFileInfo} from '@shared-lib/utils';
import {MAPPING_PREVIEW_FRAGMENT} from '../../constansts/mapping.constants';
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {
  connectorFilesDetailToFileInfo,
  fileTypeLabel,
  getPatientIdMappedColumn,
  getPatientIdTransformerConflict,
  hydrateFileInfoData,
  isAppBasedUploadSettings,
  isFileUploadSettings,
  orderColumnsLikeHeaders
} from "../../helper/connector-config-helper";
import {ConnectorDTO} from "../../dto/connector";
import {
  ResumeCachedConnectorDialogComponent
} from './components/resume-cached-connector-dialog/resume-cached-connector-dialog.component';
import {SkipTransformDialogComponent} from './components/skip-transform-dialog/skip-transform-dialog.component';
import {CohortDetailDto} from "@local-app/cohort/models";
import {rematchMappingSchemaId} from "../../helper/connector-config-schema-helper";
import {FileUploadSettings} from '../../models/input-config';
import {Store} from '@ngrx/store';
import {selectAllImports} from '../../store/import/import.selectors';
import {ImportActivityChipComponent} from '../import/import-activity-chip/import-activity-chip.component';

const SOURCE_STEPS: (string | number)[] = [
  ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG,
  ConnectorStepConfigs.STEP_SOURCE_APP_BASED,
  ConnectorStepConfigs.STEP_SOURCE_FTP_CONFIG,
  ConnectorStepConfigs.STEP_SOURCE_FUNCTION_CONFIG,
];

type RouteData = Data & {
  breadcrumb: string | any,
  mode: ConnectorManagementMode,
  connector: ConnectorDTO,
  cohort: CohortDetailDto,
}

function withChanges(card: ConnectorCard, changes: Partial<ConnectorCard>): ConnectorCard {
  const changed = (Object.keys(changes) as (keyof ConnectorCard)[])
    .some(key => card[key] !== changes[key]);
  return changed ? {...card, ...changes} : card;
}

function isSameStep(a: ConnectorCard, b: ConnectorCard): boolean {
  return a.type === b.type && (a.type === 'TRANSFORM' ? a.id === b.id : a.step === b.step);
}

@Component({
  selector: 'app-manage-connector',
  templateUrl: './manage-connector.component.html',
  styleUrl: './manage-connector.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDrawerContainer, MatDrawer, ConnectorStepCardsComponent, MatDivider, CdkDropListGroup, CdkDropList, CdkDrag, MatDrawerContent, ConnectorStepConfigComponent, ConnectorDynamicTableComponent, ConnectorEditMapperComponent, MatToolbar, TranslatePipe, SkeletonLoaderComponent, BtnComponent, ImportActivityChipComponent, MatIcon, MatIconButton, MatTooltip, AppBasedTransformerComponent]
})
export class ManageConnectorComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly functionService = inject(FunctionService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly connectorPreviewService = inject(ConnectorPreviewService);
  private readonly connectorService = inject(ConnectorService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly uploadService = inject(ConnectorUploadService);
  private readonly store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);

  private readonly allImports = this.store.selectSignal(selectAllImports);
  readonly ongoingImports = computed(() =>
    this.allImports().filter(activity => activity.cohortId === this.cohortId()));

  private readonly initialCard: ConnectorCard = {
    index: 0,
    title: this.translate.instant('SOURCE'),
    content: this.translate.instant('SELECT_DATA_SOURCE'),
    step: ConnectorStepConfigs.STEP_SOURCE_CONFIG,
    type: 'CONFIG'
  };

  cohortId = input.required<number>();

  hasContinue = signal(false);
  private _configComponent?: ConnectorStepConfigComponent;

  private readonly mappingCard = signal<ConnectorCard>({
    index: 99,
    title: this.translate.instant('MAPPER'),
    content: this.translate.instant('MAP_TO_SCHEMA'),
    step: ConnectorStepConfigs.MAPPER,
    type: 'MAPPING',
  });

  @ViewChild('configComponent')
  set configComponent(ref: ConnectorStepConfigComponent | undefined) {
    this._configComponent = ref;
    this.hasContinue.set(!!ref);
  }

  get configComponent(): ConnectorStepConfigComponent | undefined {
    return this._configComponent;
  }

  baseRoute = 'connector';

  functions: FunctionsDetailDTO[] = [TOOLS_TRANSFORMER_MODULE];
  readonly transformers = signal(new Map<string, FunctionsDetailDTO>());
  readonly transformerList = computed(() => Array.from(this.transformers().values()));
  readonly transformedData = signal(new Map<string, any[]>());
  /** Each step's column order, which its rows cannot keep for number-like names such as "2019". */
  readonly transformedColumns = signal(new Map<string, string[]>());
  /** Where each previewed step came from, so the wizard can show which ones were cached. */
  readonly previewStages = signal(new Map<string, PreviewStageDTO>());
  readonly disableAddTransformer = signal(true);

  toolbarManagement: {
    showToolbar: boolean;
    showSaveButton: boolean;
  } = {
    showToolbar: true,
    showSaveButton: false
  }

  readonly cards = signal<ConnectorCard[]>([this.initialCard]);
  readonly currentStep = signal<ConnectorCard>(this.initialCard);
  readonly config = signal<ConnectorDTO>({} as ConnectorDTO);

  readonly configCards = computed(() => this.cards().filter(card => card.type === 'CONFIG'));
  readonly transformCards = computed(() => this.cards().filter(card => card.type === 'TRANSFORM'));

  readonly mappingCards = computed<ConnectorCard[]>(() => {
    const offset = this.transformCards().length === 0 ? 1 : 0;
    return [{...this.mappingCard(), index: this.cards().length + offset}];
  });

  readonly transformerPlaceholderCard = computed<ConnectorCard>(() => ({
    index: this.configCards().length,
    title: this.translate.instant('TRANSFORMER'),
    configured: false,
    optional: true,
    step: ConnectorStepConfigs.TRANSFORM,
    type: 'TRANSFORM',
  }));

  resolvedCohort = signal<CohortDetailDto | undefined>(undefined);

  public updateConfig(value: ConnectorDTO): void {
    const outputChanged = this.selectedOutputOf(this.config()) !== this.selectedOutputOf(value);
    this.config.set(value);
    this.syncCardState();
    this.saveConfigToLocalStorage();
    if (outputChanged && this.transformCards().length > 0) {
      this.transformedData.set(new Map());
      this.transformedColumns.set(new Map());
      this.applyTransform();
    }
  }

  private selectedOutputOf(config?: ConnectorDTO): string {
    const inputConfig = config?.inputConfig;
    return JSON.stringify(inputConfig && isAppBasedUploadSettings(inputConfig) ? inputConfig.selectedOutputs : undefined);
  }

  ngOnInit(): void {
    this.baseRoute = "cohort/" + this.cohortId() + "/connector";
    const resolvedCohort = this.activatedRoute.snapshot.data['cohort'];
    if (resolvedCohort != null) {
      this.resolvedCohort.set(resolvedCohort);
    }

    this.functionService.getAllFunctionsDetails().subscribe(data => {
      this.functions.push(...data);
      this.hydrateTransformerDetails();
    });

    this.activatedRoute.data
      .pipe(map(data => data as RouteData))
      .subscribe(({mode, connector}) => {
        this.ensureConfigCurrentCohort();

        switch (mode) {
          case ConnectorManagementMode.NEW:
            this.handleNewConnector();
            break;

          case ConnectorManagementMode.EDIT:
            this.applyConnectorConfig(connector);
            break;

          case ConnectorManagementMode.DUPLICATE:
            this.applyConnectorConfig({
              ...connector,
              id: undefined,
              version: undefined,
              name: '',
              description: '',
            } as any);
            break;
        }
      });

    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment === MAPPING_PREVIEW_FRAGMENT) {
        this.handleMappingPreview();
      }
    });

    if (this.cards().length > 2) {
      this.disableAddTransformer.set(false);
    }
  }

  private getStorageName(): string {
    return 'connectorConfig' + this.cohortId();
  }

  private orderedTransformers(): Map<string, FunctionsDetailDTO> {
    const ordered = new Map<string, FunctionsDetailDTO>();
    this.transformCards().forEach(card => {
      const transformer = card.id ? this.transformers().get(card.id) : undefined;
      if (transformer) {
        ordered.set(card.id!, transformer);
      }
    });
    return ordered;
  }

  private saveConfigToLocalStorage(): void {
    const config = this.config();
    const draft = configToConnectorDraft(this.transformers().size > 0
      ? {...config, transformer: this.transformerList()}
      : config);
    try {
      localStorage.setItem(this.getStorageName(), JSON.stringify(draft));
    } catch (error) {
      console.warn('Unable to save the connector draft to local storage.', error);
    }
  }

  private loadConfigFromLocalStorage(removeId: boolean = false): void {
    const storedConfig = localStorage.getItem(this.getStorageName());
    if (storedConfig) {
      let config = connectorDraftToConfig(JSON.parse(storedConfig));
      if (removeId) {
        (config.id as any) = null;
        if (this.resolvedCohort()) {
          config = rematchMappingSchemaId(config, this.resolvedCohort()!)
        }
      }
      this.config.set(config);
      if (removeId) {
        this.saveConfigToLocalStorage();
      }
      this.ensureConfigCurrentCohort();
      this.setCards(configToCards(this.config()));
      this.syncCardState();
      const cards = this.cards();
      if (cards.length > 1) {
        this.currentStep.set(cards[cards.length - 1]);
        this.toolbarManagement.showToolbar = true;
      }
    }
  }

  private hasStoredConfig(): boolean {
    const stored = localStorage.getItem(this.getStorageName());
    if (!stored) return false;
    try {
      const config: ConnectorDTO = JSON.parse(stored);
      return !!config.inputSource && !config.id;
    } catch {
      return false;
    }
  }

  private ensureConfigCurrentCohort(): void {
    const cohortId = this.cohortId();
    if (this.config().cohortId !== cohortId) {
      this.config.update(config => ({...config, cohortId}));
    }
  }


  private loadTransformers(transformers?: ConnectorDTO['transformer']): void {
    if (!transformers) {
      return;
    }
    this.transformers.update(current => {
      const loaded = new Map(current);
      transformers.forEach((transformer, index) => {
        loaded.set(index.toString(), this.withFunctionDetails(transformer));
      });
      return loaded;
    });
    this.syncCardState();
    this.applyTransform();
  }

  private hydrateTransformerDetails(): void {
    this.transformers.update(current => new Map(Array.from(current,
      ([key, transformer]) => [key, this.withFunctionDetails(transformer)] as const)));
  }

  private withFunctionDetails(
    transformer: NonNullable<ConnectorDTO['transformer']>[number]
  ): FunctionsDetailDTO {
    const definition = this.functions.find(candidate =>
      candidate.moduleName === transformer.moduleName
      && candidate.methodName === transformer.methodName
    );

    return {
      ...definition,
      ...transformer,
      moduleName: transformer.moduleName ?? definition?.moduleName ?? '',
      methodName: transformer.methodName ?? definition?.methodName ?? '',
      mode: definition?.mode ?? transformer.mode ?? FunctionExecutionMode.CELL,
      appVersionId: transformer.appVersionId == null ? null : Number(transformer.appVersionId),
      parameters: definition?.parameters
        ?? ('parameters' in transformer ? transformer.parameters : undefined)
        ?? [],
      returnKeys: definition?.returnKeys
        ?? ('returnKeys' in transformer ? transformer.returnKeys : undefined)
        ?? [],
    };
  }

  public onInputFileChanged(): void {
    this.reloadInputFileInfo();
  }

  public configChanged(event: ConnectorStepConfigChangeEmitter) {
    if (event.step === ConnectorStepConfigs.STEP_SOURCE_CONFIG && event.data.inputSource) {
      this.toolbarManagement.showToolbar = true;
      this.updateConfig(event.data);
      this.ensureSourceStepCard();
      this.currentStep.set(this.cards()[1]);
    }
    this.reAssignIndex();

    if (this.cards().length > 2) {
      this.disableAddTransformer.set(false);
    }
    this.saveConfigToLocalStorage();
  }

  public onCardClick(card: ConnectorCard) {
    this.currentStep.set({...card});
    this.saveConfigToLocalStorage();
  }

  public onContinueClick() {
    if (this.hasContinue() && this.configComponent && this.configComponent.onContinueClick()) {
      const step = this.currentStep().step;
      if (step === ConnectorStepConfigs.STEP_SOURCE_CONFIG) {
        this.ensureSourceStepCard();
        const sourceStepCard = this.cards()[1];
        if (sourceStepCard) {
          this.currentStep.set(sourceStepCard);
        }
      } else if (
        step === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG
        || step === ConnectorStepConfigs.STEP_SOURCE_APP_BASED
      ) {
        this.ensureSelectorsCard();
        this.currentStep.set(this.findCard(this.currentStep().index + 1));
      } else if (step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG) {
        this.ensureSelectorsCard();
        this.reAssignIndex();
        this.saveConfigToLocalStorage();
        this.dialog.open(SkipTransformDialogComponent, {
          width: '460px',
          autoFocus: false,
        }).afterClosed().subscribe((addTransform: boolean | undefined) => {
          // undefined: dismissed via backdrop or Escape, so the wizard stays on this step.
          if (addTransform === true) {
            this.addTransform();
          } else if (addTransform === false) {
            this.currentStep.set(this.mappingCards()[0]);
            this.reAssignIndex();
            this.saveConfigToLocalStorage();
          }
        });
        return;
      }
    }
    this.reAssignIndex();
    this.saveConfigToLocalStorage();
  }

  drop(event: CdkDragDrop<ConnectorCard[]>) {
    const currentConfigCount = this.configCards().length;
    const prevIndex = event.previousIndex + currentConfigCount;
    const currentIndex = event.currentIndex + currentConfigCount;
    const cards = [...this.cards()];
    if (event.previousContainer === event.container) {
      moveItemInArray(cards, prevIndex, currentIndex);
    } else {
      transferArrayItem(
        [...event.previousContainer.data],
        cards,
        prevIndex,
        currentIndex,
      );
    }
    this.setCards(cards);
    this.reAssignIndex();
    // Everything that sends the steps (preview, "Run step", save, draft) reads the map in its
    // insertion order, so it has to follow the new card order.
    this.transformers.set(this.orderedTransformers());
    this.applyTransform();
  }

  public reAssignIndex() {
    this.setCards(this.cards().map((card, index) => withChanges(card, {index})));
  }

  private setCards(cards: ConnectorCard[]): void {
    const current = this.cards();
    const unchanged = cards.length === current.length && cards.every((card, i) => card === current[i]);
    if (unchanged) {
      return;
    }
    this.cards.set(cards);

    const selected = this.currentStep();
    const match = selected ? cards.find(card => isSameStep(card, selected)) : undefined;
    if (match && match !== selected) {
      this.currentStep.set(match);
    }
  }

  private patchCards(matches: (card: ConnectorCard) => boolean, changes: Partial<ConnectorCard>): void {
    this.setCards(this.cards().map(card => matches(card) ? withChanges(card, changes) : card));
  }

  public getLatestColumns(): string[] {
    if (this.transformedData().size > 0) {
      const latestData = this.getTransformedData();
      if (latestData.length > 0 && latestData[0]) {
        const latestId = this.findLastRunedConnectorCard()?.id;
        return (latestId && this.transformedColumns().get(latestId)) || Object.keys(latestData[0]);
      }
    }
    const primarySheet = getPrimarySheet(this.config().fileInfo);
    return primarySheet?.renamedColumns || primarySheet?.columns || [];
  }

  public getMapperColumns(): string[] {
    return orderColumnsLikeHeaders(this.getLatestColumns(), this.config().fileInfo, this.config().mergeConfig);
  }

  public getLatestData(): any[] {
    if (this.transformedData().size > 0) {
      return this.getTransformedData();
    }
    const primarySheet = getPrimarySheet(this.config().fileInfo);
    return primarySheet?.data || [];
  }

  public getTransformerForCard(card: ConnectorCard) {
    return this.transformers().get(card.id!);
  }

  public get patientIdTransformerConflict(): string | undefined {
    return getPatientIdTransformerConflict(
      this.config().schemaMapping,
      this.transformerList()
    );
  }

  public openTransformationOverview(): void {
    const primarySheet = getPrimarySheet(this.config().fileInfo);
    const sourceColumns = primarySheet?.renamedColumns?.length
      ? primarySheet.renamedColumns
      : primarySheet?.columns ?? [];

    this.dialog.open<TransformationOverviewDialogComponent, TransformationOverviewDialogData>(
      TransformationOverviewDialogComponent,
      {
        width: '90vw',
        maxWidth: '1180px',
        maxHeight: '90vh',
        autoFocus: false,
        data: {
          sourceColumns,
          transformers: this.transformerList(),
        },
      }
    );
  }

  public onEditTransformer(card: ConnectorCard, errorMessage?: string) {
    const currentConfig = this.getTransformerForCard(card);
    const dialogRef = this.dialog.open(ConnectorTransformerFunctionManagerComponent, {
      minWidth: 'min(900px, 94vw)',
      height: '84vh',
      width: '80vw',
      maxWidth: '1440px',
      maxHeight: '94vh',
      autoFocus: false,
      data: {
        functions: this.functions,
        columns: this.getLatestColumns(),
        patientIdColumn: getPatientIdMappedColumn(this.config().schemaMapping),
        data: currentConfig,
        errorMessage: errorMessage,
      }
    });

    dialogRef.afterClosed().subscribe((result: FunctionsDetailDTO | { delete: boolean }) => {
      if (!result) {
        this.removeUnsavedTransformerCard(card);
        return;
      }

      if ('delete' in result) {
        const hadTransformer = !!card.id && this.transformers().has(card.id);
        this.setCards(this.cards().filter(c => c.id !== card.id));
        if (hadTransformer) {
          this.transformers.update(current => {
            const remaining = new Map(current);
            remaining.delete(card.id!);
            return remaining;
          });
          this.transformedData.update(current => {
            const remaining = new Map(current);
            remaining.delete(card.id!);
            return remaining;
          });
          this.transformedColumns.update(current => {
            const remaining = new Map(current);
            remaining.delete(card.id!);
            return remaining;
          });
        }
        this.reAssignIndex();
        if (this.currentStep()?.id === card.id) {
          this.currentStep.set(this.getFallbackStepAfterDelete(card.index));
        }
        this.syncCardState();
        if (hadTransformer) {
          this.applyTransform();
        }
        return;
      }

      this.transformers.update(current => new Map(current).set(card.id!, result));
      this.patchCards(existing => existing.id === card.id, {title: result.methodName, configured: true});
      this.disableAddTransformer.set(false);

      this.applyTransform();
    });
  }

  private removeUnsavedTransformerCard(card: ConnectorCard): void {
    if (!card.id || this.transformers().has(card.id)) {
      return;
    }

    this.setCards(this.cards().filter(existing => existing.id !== card.id));
    this.reAssignIndex();
    if (this.currentStep()?.id === card.id) {
      this.currentStep.set(this.getFallbackStepAfterDelete(card.index));
    }
    this.syncCardState();
  }

  public addTransform() {
    this.syncCardState();
    const r = random(0, 100000, false)
    const newCard: ConnectorCard = {
      index: this.cards().length,
      title: this.translate.instant('TRANSFORMER'),
      configured: false,
      optional: true,
      step: ConnectorStepConfigs.TRANSFORM,
      type: 'TRANSFORM', id: r.toString()
    };
    this.setCards([...this.cards(), newCard]);
    this.onEditTransformer(newCard);
    this.disableAddTransformer.set(true);
    this.currentStep.set(this.findCard(this.cards().length - 1));
  }

  public applyTransform() {
    const transFormerCards = this.transformCards();
    if (transFormerCards.length === 0) {
      this.transformedData.set(new Map());
      this.previewStages.set(new Map());
      this.saveConfigToLocalStorage();
      return;
    }

    const config = cloneDeep(this.config())
    const previewedIds = new Set(transFormerCards.map(card => card.id));
    const isPreviewed = (card: ConnectorCard) => card.type === 'TRANSFORM' && previewedIds.has(card.id);

    this.patchCards(isPreviewed, {previewRunning: true});
    this.connectorPreviewService.preview(transFormerCards, config, this.transformers(), this.cohortId()).subscribe({
      next: (data) => {
        this.patchCards(isPreviewed, {previewRunning: false});
        this.transformedData.set(data.rows);
        this.transformedColumns.set(data.columns);
        this.previewStages.set(data.stages);
      },
      error: (error) => {
        this.patchCards(isPreviewed, {previewRunning: false});
        const inputConfig = this.config().inputConfig;
        if (inputConfig && isFileUploadSettings(inputConfig) && !inputConfig.fileExists) {
          return;
        }

        const failedCard = this.findFailedTransformerCard(transFormerCards);
        const errorMessage = this.extractErrorMessage(error);

        if (failedCard) {
          this.onEditTransformer(failedCard, errorMessage);
        } else {
          console.error('Transformation error:', errorMessage);
        }
      }
    });
    this.saveConfigToLocalStorage();
  }

  public isAwaitingAppRun(): boolean {
    const stage = this.getCurrentStage();
    return !!stage && (stage.requiresRun || !!stage.blockedByStep);
  }

  public openTransformStep(stepIndex: number): void {
    const card = this.transformCards()[stepIndex - 1];
    if (card) {
      this.onCardClick(card);
    }
  }

  public getStageIcon(stage: PreviewStageDTO): string {
    if (stage.requiresRun) {
      return 'play_circle';
    }
    return stage.cached ? 'bolt' : 'autorenew';
  }

  public getStageTooltipKey(stage: PreviewStageDTO): string {
    if (stage.requiresRun) {
      return 'PREVIEW_CACHE.NOT_RUN';
    }
    return stage.cached ? 'PREVIEW_CACHE.FROM_CACHE' : 'PREVIEW_CACHE.COMPUTED_NOW';
  }

  public getCurrentStage(): PreviewStageDTO | undefined {
    const id = this.currentStep()?.id;
    return id ? this.previewStages().get(id) : undefined;
  }

  public openPreviewCacheDialog(): void {
    const stage = this.getCurrentStage();
    if (!stage) {
      return;
    }
    const currentStep = this.currentStep();
    const transformCards = this.transformCards();
    const position = transformCards.findIndex(card => card.id === currentStep.id);
    const followingSteps = position < 0 ? 0 : Math.max(0, transformCards.length - position - 1);

    this.dialog.open<PreviewCacheDialogComponent, PreviewCacheDialogData, PreviewCacheDialogResult>(
      PreviewCacheDialogComponent,
      {data: {stage, stepTitle: currentStep.title, followingSteps}, width: '32rem'}
    ).afterClosed().subscribe(result => {
      if (!result?.invalidated) {
        return;
      }
      this.invalidatePreviewCacheFrom(result.fromStep);
    });
  }

  private invalidatePreviewCacheFrom(fromStep: number): void {
    const connectorId = this.config().id;
    if (!connectorId) {
      // Nothing was cached for an unsaved connector, so recomputing is all that is needed.
      this.applyTransform();
      return;
    }
    this.connectorPreviewService.invalidateCache(Number(connectorId), fromStep).subscribe(() => {
      // Recompute what was just dropped; validation runs off the refreshed preview.
      this.applyTransform();
    });
  }

  public onBackClick() {
    this.currentStep.set(this.findCard(this.currentStep().index - 1));
  }

  public getTransformer(): FunctionsDetailDTO | undefined {
    const id = this.currentStep().id;
    if (!id) {
      return;
    }
    return this.transformers().get(id);

  }

  /** The columns this step writes, which the preview table marks in its header. */
  public getTransformedColumns(): string[] {
    const transformer = this.getTransformer();
    if (!transformer) {
      return [];
    }
    // An app step carries no mode of its own - nothing persists one - so it loaded back as CELL and
    // fell through to a column it does not have, leaving its output columns unmarked. What it
    // writes is its return mapping, exactly like a row function.
    const usesMappings = !!transformer.appImage || transformer.mode !== FunctionExecutionMode.CELL;
    if (usesMappings) {
      if (transformer.returnMapping === undefined) {
        return [];
      }
      const map = new Map<string, string>(Object.entries(transformer.returnMapping || {}));
      return Array.from(map.values());
    }
    return transformer.column?.split(',') || [];
  }

  public findLastRunedConnectorCard(): ConnectorCard | undefined {
    const cards = this.transformCards();
    if (cards.length === 0) {
      return undefined;
    }
    for (let i = cards.length - 1; i >= 0; i--) {
      if (cards[i]?.previewRunning === false) {
        return cards[i];
      }
    }
    for (let i = cards.length - 1; i >= 0; i--) {
      if (cards[i]?.configured) {
        return cards[i];
      }
    }
    return cards[cards.length - 1];
  }

  public getTransformedData(): any[] {
    const primarySheet = getPrimarySheet(this.config().fileInfo);
    const columnsLength = primarySheet?.columns?.length || 0;
    const defaultData = Array(columnsLength)
    const latestId = this.findLastRunedConnectorCard()?.id;
    if (!latestId) {
      return defaultData;
    }
    const transformedData = this.transformedData();
    if (!transformedData.has(latestId)) {
      return defaultData;
    }
    return transformedData.get(latestId)!;
  }

  /** The rows the selected transform step produced, which is what its preview table shows. */
  public getCurrentStepData(): any[] | undefined {
    const id = this.currentStep()?.id;
    return id ? this.transformedData().get(id) : undefined;
  }

  public getCurrentStepColumns(): string[] | undefined {
    const id = this.currentStep()?.id;
    return id ? this.transformedColumns().get(id) : undefined;
  }

  private findCard(index: number): ConnectorCard {
    const cards = this.cards();
    return cards.find(card => card.index === index)
      ?? cards[cards.length - 1]
      ?? this.initialCard;
  }

  private getFallbackStepAfterDelete(deletedIndex: number): ConnectorCard {
    const cards = this.cards();
    return cards.find(card => card.index >= deletedIndex)
      ?? cards[deletedIndex - 1]
      ?? cards[cards.length - 1]
      ?? this.initialCard;
  }

  public onMappingChange(schemaMapping: ConnectorMappingConfig[] | undefined) {
    this.config.update(config => ({...config, schemaMapping}));
    this.syncCardState();
  }

  public onMappingCardContentChange(content: string) {
    this.mappingCard.update(card => ({...card, content}));
  }

  public onClearClick() {
    this.updateConfig({} as ConnectorDTO);
    this.clearConnectorValues();

    this.setCards([this.initialCard]);
    this.currentStep.set(this.initialCard);
  }

  public onCancelClick() {
    this.router.navigate([this.baseRoute]);
  }

  public saveConfig(navigate: boolean = false) {
    if (this.patientIdTransformerConflict) {
      return;
    }

    this.config.update(config => ({
      ...config,
      transformer: this.transformerList(),
      cohortId: this.cohortId(),
    }));

    const {name, description} = this.config();
    if (!name || !description) {
      this.openSaveDialog(navigate, {name, description});
      return;
    }

    this.persistConnector(navigate);
  }

  private openSaveDialog(
    navigate: boolean,
    options?: { name?: string; description?: string; errorMessage?: string }
  ): void {
    const dialogRef = this.dialog.open(ManageConnectorSaveDialogComponent, {
      data: {
        name: options?.name ?? this.config().name ?? '',
        description: options?.description ?? this.config().description ?? '',
        errorMessage: options?.errorMessage,
      },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.config.update(config => ({...config, name: result.name, description: result.description}));
      this.saveConfigToLocalStorage();
      this.persistConnector(navigate);
    });
  }

  private persistConnector(navigate: boolean): void {
    this.connectorService.save(this.config()).subscribe({
      next: data => {
        this.config.update(config => ({...config, id: data.id}));
        this.clearConnectorValues();
        if (navigate) {
          this.navigateToView(data.id!);
        }
      },
      error: error => {
        const errorMessage = this.getSaveErrorMessage(error);
        this.openSaveDialog(navigate, {
          name: this.config().name,
          description: this.config().description,
          errorMessage,
        });
      },
    });
  }

  private getSaveErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }

    return this.translate.instant('ERROR.SAVE_CONNECTOR_GENERIC');
  }

  private extractErrorMessage(error: any): string {
    if (error?.error?.detail) {
      const detail = error.error.detail;
      return this.cleanErrorMessage(detail);
    }

    if (error?.error?.message) {
      return this.cleanErrorMessage(error.error.message);
    }

    return this.translate.instant('ERROR.TRANSFORMATION_FAILED_GENERIC');
  }

  private cleanErrorMessage(message: string): string {
    if (!message) {
      return this.translate.instant('ERROR.TRANSFORMATION_FAILED_GENERIC');
    }

    const technicalPrefixPattern = /^ERROR:\s*[^:]+\s*\([^)]+\):\s*(.+)$/;
    const match = message.match(technicalPrefixPattern);

    if (match && match[1]) {
      return match[1].trim();
    }

    const simplePrefixPattern = /^ERROR:\s*(.+)$/;
    const simpleMatch = message.match(simplePrefixPattern);

    if (simpleMatch && simpleMatch[1]) {
      return simpleMatch[1].trim();
    }

    return message.trim();
  }

  private findFailedTransformerCard(transFormerCards: ConnectorCard[]): ConnectorCard | undefined {
    return transFormerCards.length > 0 ? transFormerCards[transFormerCards.length - 1] : undefined;
  }

  public navigateToView(id: number) {
    this.router.navigate([this.baseRoute, 'view', id]);
  }

  private applyConnectorConfig(config: ConnectorDTO): void {
    this.config.set(config);
    this.syncCardState();

    this.checkFile();

    this.saveConfigToLocalStorage();
    this.loadConfigFromLocalStorage();
    this.loadTransformers(this.config().transformer);
    this.clearConnectorValues();

    const selectorsCard = this.cards().find(card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
    if (selectorsCard && this.hasUnmergedTables()) {
      this.currentStep.set(selectorsCard);
      this.snackBar.open(
        this.translate.instant('CONNECTOR_FILE_STRUCTURE_CHANGED'),
        this.translate.instant('BUTTON.CLOSE'), {
          duration: 10000,
          verticalPosition: 'top',
        });
    } else if (selectorsCard) {
      this.currentStep.set(this.mappingCards()[0]);
    }
  }

  private hasUnmergedTables(): boolean {
    const {inputConfig, fileInfo, mergeConfig} = this.config();
    return !!inputConfig && isFileUploadSettings(inputConfig)
      && !mergeConfig
      && Object.keys(fileInfo ?? {}).length > 1;
  }

  private clearConnectorValues(): void {
    localStorage.removeItem(this.getStorageName());
  }

  private handleNewConnector(): void {
    if (!this.hasStoredConfig()) {
      this.resetConnectorEditorState();
      this.clearConnectorValues();
      return;
    }

    this.dialog.open(ResumeCachedConnectorDialogComponent, {
      width: '480px',
      autoFocus: false,
      disableClose: true,
    }).afterClosed().subscribe(continueDraft => {
      if (continueDraft) {
        this.resetConnectorEditorState();
        this.loadConfigFromLocalStorage(true);
        this.loadTransformers(this.config().transformer);
        this.checkFile();
        return;
      }

      this.resetConnectorEditorState();
      this.clearConnectorValues();
    });
  }

  private resetConnectorEditorState(): void {
    this.config.set({} as ConnectorDTO);
    this.setCards([this.initialCard]);
    this.currentStep.set(this.initialCard);
    this.transformers.set(new Map());
    this.transformedData.set(new Map());
    this.transformedColumns.set(new Map());
    this.disableAddTransformer.set(true);
    this.toolbarManagement.showToolbar = true;
    this.syncCardState();
  }

  public getPrimarySheetInfo(): UploadInfoDTO | undefined {
    return getPrimarySheet(this.config().fileInfo);
  }

  public hasFileInfo(): boolean {
    const fileInfo = this.config().fileInfo;
    return !!(fileInfo && Object.keys(fileInfo).length > 0);
  }

  public canShowDownstreamSteps(): boolean {
    return this.hasFileInfo() && this.cards().some(
      card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG
    );
  }

  private checkFileExistence(): void {
    const inputConfig = this.config().inputConfig;
    if (!inputConfig || inputConfig.mode !== 'FILE') {
      return;
    }
    if (!isFileUploadSettings(inputConfig)) {
      return;
    }

    this.uploadService
      .getFirstCohortFileInfo(this.cohortId())
      .pipe(take(1))
      .subscribe({
        next: (fileInfoDetail) => {
          const fileInfo = connectorFilesDetailToFileInfo(fileInfoDetail);
          if (hasValidFileInfo(fileInfo)) {
            this.setFileInfo(fileInfo, true);
          } else {
            this.triggerReuploadFile();
          }
        },
        error: () => {
          this.triggerReuploadFile();
        }
      });
  }

  private reloadInputFileInfo(): void {
    const inputConfig = this.config().inputConfig;
    if (!inputConfig || !isFileUploadSettings(inputConfig) || !inputConfig.fileId) {
      return;
    }

    this.uploadService
      .getFileDetail(this.cohortId(), inputConfig.fileId)
      .pipe(take(1))
      .subscribe({
        next: (fileInfoDetail) => {
          const fileInfo = connectorFilesDetailToFileInfo(fileInfoDetail);
          if (!hasValidFileInfo(fileInfo)) {
            return;
          }

          this.setFileInfo(fileInfo, false);
          this.transformedData.set(new Map());
          this.transformedColumns.set(new Map());
          if (this.transformCards().length > 0) {
            this.applyTransform();
          }
        },
      });
  }

  private setFileInfo(fileInfo: Record<string, UploadInfoDTO>, merge: boolean): void {
    const config = this.config();
    const nextFileInfo = merge ? {...config.fileInfo, ...fileInfo} : fileInfo;
    hydrateFileInfoData(nextFileInfo);

    this.config.set({
      ...config,
      fileInfo: nextFileInfo,
    });
    this.syncCardState();
    this.saveConfigToLocalStorage();
  }

  private triggerReuploadFile(): void {
    this.updateConfig(setMissingFileInfo(this.config()));

    this.onCardClick(this.configCards().find(card => card.step === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG)!);
  }

  private handleMappingPreview(): void {
    this.onCardClick(this.mappingCards()[0]);
  }

  private checkFile(): void {
    // Only an uploaded file can go missing. Other sources (an app's stored outputs, FTP, ...) have
    // no FILE step to send the user back to, and doing so left the wizard without a current step.
    const inputConfig = this.config()?.inputConfig;
    if (!inputConfig || !isFileUploadSettings(inputConfig)) {
      return;
    }

    const fileExists = (inputConfig as FileUploadSettings)?.fileExists ?? false;

    if (!fileExists) {
      setTimeout(() => this.triggerReuploadFile());
      return;
    }

    if (!hasValidFileInfo(this.config()?.fileInfo)) {
      this.checkFileExistence();
    }
  }

  private syncCardState(): void {
    const config = this.config();
    const hasFileInfo = this.hasFileInfo();

    this.setCards(this.cards().map(card => {
      if (card.step === ConnectorStepConfigs.STEP_SOURCE_CONFIG) {
        return withChanges(card, {
          content: config.inputSource?.title ?? this.translate.instant('SELECT_DATA_SOURCE'),
          configured: !!config.inputSource,
        });
      }
      if (SOURCE_STEPS.includes(card.step)) {
        return withChanges(card, {
          configured: this.isSourceStepConfigured(),
          content: this.getSourceStepContent(),
        });
      }
      if (card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG) {
        return withChanges(card, {configured: hasFileInfo});
      }
      if (card.type === 'TRANSFORM') {
        return withChanges(card, {configured: !!card.id && this.transformers().has(card.id)});
      }
      return card;
    }));

    const cards = this.cards();
    const hasSelectorsCard = cards.some(card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
    const hasSourceStepCard = cards.some(card => SOURCE_STEPS.includes(card.step));
    if (!hasSelectorsCard && hasFileInfo && hasSourceStepCard) {
      this.ensureSelectorsCard();
    }

    this.disableAddTransformer.set(!hasFileInfo || this.transformCards().some(card => !card.configured));
  }

  private ensureSourceStepCard(): void {
    const inputSource = this.config().inputSource;
    if (!inputSource) {
      return;
    }

    const stepCard: ConnectorCard = {
      index: 1,
      title: `${inputSource.title} ${this.translate.instant('SETTINGS')}`,
      configured: this.isSourceStepConfigured(),
      content: this.getSourceStepContent(),
      step: inputSource.configName,
      type: 'CONFIG'
    };

    const cards = [...this.cards()];
    if (cards.length > 1) {
      cards[1] = stepCard;
    } else {
      cards.push(stepCard);
    }
    this.setCards(cards);
  }

  private ensureSelectorsCard(): void {
    const newCard: ConnectorCard = {
      index: 2,
      title: ` ${this.translate.instant('SPECIFY_HEADER')}`,
      configured: this.hasFileInfo(),
      step: ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
      type: 'CONFIG'
    };

    const cards = [...this.cards()];
    const existingIndex = cards.findIndex(
      card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG
    );
    if (existingIndex >= 0) {
      cards[existingIndex] = {...newCard, index: existingIndex};
    } else {
      cards.splice(Math.min(2, cards.length), 0, newCard);
    }
    this.setCards(cards);
    this.reAssignIndex();
  }

  private isSourceStepConfigured(): boolean {
    const inputConfig = this.config().inputConfig;
    if (!inputConfig) {
      return false;
    }

    if (isFileUploadSettings(inputConfig)) {
      return !!inputConfig.fileId && inputConfig.fileExists !== false;
    }

    if (inputConfig.mode === 'APP') {
      return 'appVersionId' in inputConfig && !!inputConfig.appVersionId;
    }

    if (inputConfig.mode === 'FTP') {
      return 'filePath' in inputConfig && !!inputConfig.filePath;
    }

    if (inputConfig.mode === 'FUNCTION') {
      return 'function' in inputConfig && !!inputConfig.function;
    }

    return false;
  }

  private getSourceStepContent(): string | undefined {
    const inputConfig = this.config().inputConfig;
    if (!inputConfig) {
      return undefined;
    }

    if (isFileUploadSettings(inputConfig) && inputConfig.fileId && inputConfig.fileExists === false) {
      return this.translate.instant('CONNECTOR_FILE_MISSING.BADGE');
    }

    if ('fileType' in inputConfig) {
      return `${this.translate.instant('FILE_TYPE')}: ${fileTypeLabel(inputConfig as FileUploadSettings) ?? this.translate.instant('UNKNOWN')}`;
    }

    if (inputConfig.mode === 'FTP') {
      return ('filePath' in inputConfig ? inputConfig.filePath : undefined)
        || ('host' in inputConfig ? inputConfig.host : undefined);
    }

    if (inputConfig.mode === 'FUNCTION') {
      return 'function' in inputConfig ? inputConfig.function : undefined;
    }

    return undefined;
  }
}

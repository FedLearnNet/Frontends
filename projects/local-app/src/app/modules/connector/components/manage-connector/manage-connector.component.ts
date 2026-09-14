import {Component, computed, inject, input, OnInit, signal, ViewChild} from '@angular/core';
import {ConnectorCard} from "../../models/connector-card";
import {ConnectorStepConfigs} from "../../enum/connector-step-config";
import {ConnectorStepConfigChangeEmitter} from "../../models/connector-step-config";
import {
  configToCards,
  configToConnectorDraft,
  connectorDraftToConfig
} from "../../models/connector-config";
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
import {
  ConnectorTransformerFunctionManagerComponent
} from "./components/function/transformer-manager/transformer-manager.component";
import {
  TransformationOverviewDialogComponent,
  TransformationOverviewDialogData
} from "./components/function/transformation-overview-dialog/transformation-overview-dialog.component";
import {FunctionService} from "../../services/function.service";
import {FunctionExecutionMode, FunctionsDetailDTO} from "../../dto/function";
import {AppBasedTransformerComponent} from './components/function/app-based-transformer/app-based-transformer.component';
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
  getPatientIdMappedColumn,
  getPatientIdTransformerConflict,
  hydrateFileInfoData,
  isFileUploadSettings
} from "../../helper/connector-config-helper";
import {ConnectorDTO} from "../../dto/connector";
import {
  ResumeCachedConnectorDialogComponent
} from './components/resume-cached-connector-dialog/resume-cached-connector-dialog.component';
import {
  SkipTransformDialogComponent
} from './components/skip-transform-dialog/skip-transform-dialog.component';
import {CohortDetailDto} from "@local-app/cohort/models";
import {rematchMappingSchemaId} from "../../helper/connector-config-schema-helper";
import { FileUploadSettings } from '../../models/input-config';
import {Store} from '@ngrx/store';
import {selectAllImports} from '../../store/import/import.selectors';
import {
  ImportActivityChipComponent
} from '../import/import-activity-chip/import-activity-chip.component';

const BASE_MAPPING_CARD: ConnectorCard = {
  index: 99,
  title: 'Mapper',
  content: 'Map to Schema',
  step: ConnectorStepConfigs.MAPPER,
  type: 'MAPPING',
};

type RouteData = Data & {
  breadcrumb: string | any,
  mode: ConnectorManagementMode,
  connector: ConnectorDTO,
  cohort: CohortDetailDto,
}

@Component({
  selector: 'app-manage-connector',
  templateUrl: './manage-connector.component.html',
  styleUrl: './manage-connector.component.scss',
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

  private mappingCard = signal<ConnectorCard>({...BASE_MAPPING_CARD});

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
  transformer = new Map<string, FunctionsDetailDTO>()
  transformedData = new Map<string, any[]>()
  /** Where each previewed step came from, so the wizard can show which ones were cached. */
  previewStages = new Map<string, PreviewStageDTO>()
  disableAddTransformer = true;

  toolbarManagement: {
    showToolbar: boolean;
    showSaveButton: boolean;
  } = {
    showToolbar: true,
    showSaveButton: false
  }

  cards: ConnectorCard[] = [this.initialCard];
  currentStep: ConnectorCard = this.initialCard;
  _config: ConnectorDTO = {} as ConnectorDTO;

  resolvedCohort = signal<CohortDetailDto | undefined>(undefined);

  get config(): ConnectorDTO {
    return this._config;
  }

  set config(value: ConnectorDTO) {
    this._config = value;
    this.syncCardState();
    this.saveConfigToLocalStorage();
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

    if (this.cards.length > 2) {
      this.disableAddTransformer = false;
    }
  }

  private getStorageName(): string {
    return 'connectorConfig' + this.cohortId();
  }

  private saveConfigToLocalStorage(): void {
    const draft = configToConnectorDraft(this._config);
    try {
      localStorage.setItem(this.getStorageName(), JSON.stringify(draft));
    } catch (error) {
      console.warn('Unable to save the connector draft to local storage.', error);
    }
  }

  private loadConfigFromLocalStorage(removeId: boolean = false): void {
    const storedConfig = localStorage.getItem(this.getStorageName());
    if (storedConfig) {
      this._config = connectorDraftToConfig(JSON.parse(storedConfig));
      if (removeId) {
        (this._config.id as any) = null;
        if(this.resolvedCohort()){
          this._config = rematchMappingSchemaId(this._config, this.resolvedCohort()!)
        }
        this.saveConfigToLocalStorage();
      }
      this.ensureConfigCurrentCohort();
      this.cards = configToCards(this._config);
      this.syncCardState();
      if (this.cards.length > 1) {
        this.currentStep = this.cards[this.cards.length - 1];
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
    this.config.cohortId = this.cohortId();
  }


  private loadTransformers(transformers?: ConnectorDTO['transformer']): void {
    if (!transformers) {
      return;
    }
    transformers.forEach((transformer, index) => {
      this.transformer.set(index.toString(), this.withFunctionDetails(transformer));
    });
    this.syncCardState();
    this.applyTransform();
  }

  private hydrateTransformerDetails(): void {
    this.transformer.forEach((transformer, key) => {
      this.transformer.set(key, this.withFunctionDetails(transformer));
    });
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
      this.config = event.data;
      this.ensureSourceStepCard();
      this.currentStep = this.cards[1];
    }
    this.reAssignIndex();

    if (this.cards.length > 2) {
      this.disableAddTransformer = false;
    }
    this.saveConfigToLocalStorage();
  }

  public onCardClick(card: ConnectorCard) {
    this.currentStep = {...card};
    this.saveConfigToLocalStorage();
  }

  public onContinueClick() {
    if (this.hasContinue() && this.configComponent && this.configComponent.onContinueClick()) {
      if (this.currentStep.step === ConnectorStepConfigs.STEP_SOURCE_CONFIG) {
        this.ensureSourceStepCard();
        if (this.cards[1]) {
          this.currentStep = this.cards[1];
        }
      } else if (
        this.currentStep.step === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG
        || this.currentStep.step === ConnectorStepConfigs.STEP_SOURCE_APP_BASED
      ) {
        this.ensureSelectorsCard();
        this.currentStep = this.findCard(this.currentStep.index + 1);
      } else if (this.currentStep.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG) {
        this.ensureSelectorsCard();
        this.reAssignIndex();
        this.saveConfigToLocalStorage();
        this.dialog.open(SkipTransformDialogComponent, {
          width: '460px',
          autoFocus: false,
        }).afterClosed().subscribe((addTransform: boolean | undefined) => {
          if (addTransform) {
            this.addTransform();
          } else {
            this.currentStep = {...this.mappingCard()};
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
    const currentConfigCount = this.getConfigCards().length;
    const prevIndex = event.previousIndex + currentConfigCount;
    const currentIndex = event.currentIndex + currentConfigCount;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, prevIndex, currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        prevIndex,
        currentIndex,
      );
    }
    this.reAssignIndex();
    this.applyTransform();
  }

  public reAssignIndex() {
    this.cards.forEach((card, index) => {
      card.index = index;
    });
  }

  public getLatestColumns(): string[] {
    if (this.transformedData.size > 0) {
      const latestData = this.getTransformedData();
      if (latestData.length > 0 && latestData[0]) {
        return Object.keys(latestData[0]);
      }
    }
    const primarySheet = getPrimarySheet(this.config.fileInfo);
    return primarySheet?.renamedColumns || primarySheet?.columns || [];
  }

  public getLatestData(): any[] {
    if (this.transformedData.size > 0) {
      return this.getTransformedData();
    }
    const primarySheet = getPrimarySheet(this.config.fileInfo);
    return primarySheet?.data || [];
  }

  public getTransformerForCard(card: ConnectorCard) {
    return this.transformer.get(card.id!);
  }

  public get patientIdTransformerConflict(): string | undefined {
    return getPatientIdTransformerConflict(
      this.config.schemaMapping,
      Array.from(this.transformer.values())
    );
  }

  public openTransformationOverview(): void {
    const primarySheet = getPrimarySheet(this.config.fileInfo);
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
          transformers: Array.from(this.transformer.values()),
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
        patientIdColumn: getPatientIdMappedColumn(this.config.schemaMapping),
        data: currentConfig,
        errorMessage: errorMessage,
      }
    });

    dialogRef.afterClosed().subscribe((result: FunctionsDetailDTO | { delete: boolean }) => {
      if (!result) {
        return;
      }

      if ('delete' in result) {
        this.cards = this.cards.filter(c => c.id !== card.id);
        this.disableAddTransformer = false;
        if (this.transformer.has(card.id!)) {
          this.transformer.delete(card.id!);
          this.transformedData.delete(card.id!);
          this.reAssignIndex();
          this.currentStep = this.getFallbackStepAfterDelete(card.index);
          this.applyTransform();
        }
        return;
      }

      this.transformer.set(card.id!, result);
      this.cards[card.index].title = result.methodName;
      this.disableAddTransformer = false;
      this.cards[card.index].configured = true;

      this.applyTransform();
    });
  }

  public addTransform() {
    this.syncCardState();
    const r = random(0, 100000, false)
    const newCard: ConnectorCard = {
      index: this.cards.length,
      title: this.translate.instant('TRANSFORMER'),
      configured: false,
      optional: true,
      step: ConnectorStepConfigs.TRANSFORM,
      type: 'TRANSFORM', id: r.toString()
    };
    this.cards.push(newCard);
    this.onEditTransformer(newCard);
    this.disableAddTransformer = true;
    this.currentStep = this.findCard(this.cards.length - 1);
  }

  public applyTransform() {
    const config = cloneDeep(this.config)
    const transFormerCards = this.getTransformCards();

    transFormerCards.forEach(c => {
      c.previewRunning = true;
    });
    this.connectorPreviewService.preview(transFormerCards, config, this.transformer, this.cohortId()).subscribe({
      next: (data) => {
        transFormerCards.forEach(c => {
          c.previewRunning = false;
        });
        this.transformedData = data.rows;
        this.previewStages = data.stages;
      },
      error: (error) => {
        if (!(this.config.inputConfig as any)?.fileExists) {
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
    const card = this.getTransformCards()[stepIndex - 1];
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
    return this.currentStep?.id ? this.previewStages.get(this.currentStep.id) : undefined;
  }

  public openPreviewCacheDialog(): void {
    const stage = this.getCurrentStage();
    if (!stage) {
      return;
    }
    const transformCards = this.getTransformCards();
    const position = transformCards.findIndex(card => card.id === this.currentStep.id);
    const followingSteps = position < 0 ? 0 : Math.max(0, transformCards.length - position - 1);

    this.dialog.open<PreviewCacheDialogComponent, PreviewCacheDialogData, PreviewCacheDialogResult>(
      PreviewCacheDialogComponent,
      {data: {stage, stepTitle: this.currentStep.title, followingSteps}, width: '32rem'}
    ).afterClosed().subscribe(result => {
      if (!result?.invalidated) {
        return;
      }
      this.invalidatePreviewCacheFrom(result.fromStep);
    });
  }

  private invalidatePreviewCacheFrom(fromStep: number): void {
    const connectorId = this.config.id;
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
    this.currentStep = this.findCard(this.currentStep.index - 1);
  }

  public getConfigCards(): ConnectorCard[] {
    return this.cards.filter(card => card.type === 'CONFIG');
  }

  public getTransformCards(): ConnectorCard[] {
    return this.cards.filter(card => card.type === 'TRANSFORM');
  }

  public getTransformer(): FunctionsDetailDTO | undefined {
    if (!this.currentStep.id) {
      return;
    }
    return this.transformer.get(this.currentStep.id);

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
    const cards = this.getTransformCards();
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
    const primarySheet = getPrimarySheet(this.config.fileInfo);
    const columnsLength = primarySheet?.columns?.length || 0;
    const defaultData = Array(columnsLength)
    const latestId = this.findLastRunedConnectorCard()?.id;
    if (!latestId) {
      return defaultData;
    }
    if (!this.transformedData.has(latestId)) {
      return defaultData;
    }
    return this.transformedData.get(latestId)!;
  }

  public getMappingCards(): ConnectorCard[] {
    // When there are no transform cards, reserve one slot for the transformer placeholder
    const offset = this.getTransformCards().length === 0 ? 1 : 0;
    this.mappingCard().index = this.cards.length + offset;

    return [this.mappingCard()];
  }

  public get transformerPlaceholderCard(): ConnectorCard {
    return {
      index: this.getConfigCards().length,
      title: this.translate.instant('TRANSFORMER'),
      configured: false,
      optional: true,
      step: ConnectorStepConfigs.TRANSFORM,
      type: 'TRANSFORM',
    };
  }

  private findCard(index: number): ConnectorCard {
    return this.cards.find(card => card.index === index)
      ?? this.cards[this.cards.length - 1]
      ?? this.initialCard;
  }

  private getFallbackStepAfterDelete(deletedIndex: number): ConnectorCard {
    return this.cards.find(card => card.index >= deletedIndex)
      ?? this.cards[deletedIndex - 1]
      ?? this.cards[this.cards.length - 1]
      ?? this.initialCard;
  }

  public onMappingChange(config: ConnectorMappingConfig[]) {
    this.config.schemaMapping = config;
    this.syncCardState();
  }

  public onMappingCardContentChange(content: string) {
    this.mappingCard.update(card => ({...card, content}));
  }

  public onClearClick() {
    this.config = {} as ConnectorDTO;
    this.clearConnectorValues();

    this.cards = [this.initialCard];
    this.currentStep = this.initialCard;
  }

  public onCancelClick() {
    this.router.navigate([this.baseRoute]);
  }

  public saveConfig(navigate: boolean = false) {
    if (this.patientIdTransformerConflict) {
      return;
    }

    this._config.transformer = Array.from(this.transformer.values());
    this.config.cohortId = this.cohortId();

    if (!this.config.name || !this.config.description) {
      this.openSaveDialog(navigate, {
        name: this.config.name,
        description: this.config.description,
      });
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
        name: options?.name ?? this.config.name ?? '',
        description: options?.description ?? this.config.description ?? '',
        errorMessage: options?.errorMessage,
      },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.config.name = result.name;
      this.config.description = result.description;
      this.saveConfigToLocalStorage();
      this.persistConnector(navigate);
    });
  }

  private persistConnector(navigate: boolean): void {
    this.connectorService.save(this.config).subscribe({
      next: data => {
        this.config.id = data.id;
        this.clearConnectorValues();
        if (navigate) {
          this.navigateToView(data.id!);
        }
      },
      error: error => {
        const errorMessage = this.getSaveErrorMessage(error);
        this.openSaveDialog(navigate, {
          name: this.config.name,
          description: this.config.description,
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
    this._config = config;
    this.syncCardState();

    this.checkFile();

    this.saveConfigToLocalStorage();
    this.loadConfigFromLocalStorage();
    this.loadTransformers(this._config.transformer);
    this.clearConnectorValues();
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
        this.loadTransformers(this._config.transformer);
        this.checkFile();
        return;
      }

      this.resetConnectorEditorState();
      this.clearConnectorValues();
    });
  }

  private resetConnectorEditorState(): void {
    this._config = {} as ConnectorDTO;
    this.cards = [this.initialCard];
    this.currentStep = this.initialCard;
    this.transformer.clear();
    this.transformedData.clear();
    this.disableAddTransformer = true;
    this.toolbarManagement.showToolbar = true;
    this.syncCardState();
  }

  public getPrimarySheetInfo(): UploadInfoDTO | undefined {
    return getPrimarySheet(this.config.fileInfo);
  }

  public hasFileInfo(): boolean {
    return !!(this.config.fileInfo && Object.keys(this.config.fileInfo).length > 0);
  }

  public canShowDownstreamSteps(): boolean {
    return this.hasFileInfo() && this.cards.some(
      card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG
    );
  }

  private checkFileExistence(): void {
    if (!this.config.inputConfig || this.config.inputConfig.mode !== 'FILE') {
      return;
    }
    const inputConfig = this.config.inputConfig;
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
    const inputConfig = this._config.inputConfig;
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
          this.transformedData.clear();
          if (this.getTransformCards().length > 0) {
            this.applyTransform();
          }
        },
      });
  }

  private setFileInfo(fileInfo: Record<string, UploadInfoDTO>, merge: boolean): void {
    const nextFileInfo = merge ? {...this._config.fileInfo, ...fileInfo} : fileInfo;
    hydrateFileInfoData(nextFileInfo);

    this._config = {
      ...this._config,
      fileInfo: nextFileInfo,
    };
    this.syncCardState();
    this.saveConfigToLocalStorage();
  }

  private triggerReuploadFile(): void {
    this.config = setMissingFileInfo(this.config);

    this.onCardClick(this.getConfigCards().find(card => card.step === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG)!);
  }

  private handleMappingPreview(): void {
    this.onCardClick(this.getMappingCards()[0]);
  }

  private checkFile(): void {
    const fileExists = (this.config?.inputConfig as FileUploadSettings)?.fileExists ?? false;

    if (!fileExists) {
      setTimeout(() => this.triggerReuploadFile());
      return;
    }

    if (!hasValidFileInfo(this.config?.fileInfo)) {
      this.checkFileExistence();
    }
  }

  private syncCardState(): void {
    const sourceCard = this.cards.find(card => card.step === ConnectorStepConfigs.STEP_SOURCE_CONFIG);
    if (sourceCard) {
      sourceCard.content = this.config.inputSource?.title ?? this.translate.instant('SELECT_DATA_SOURCE');
      sourceCard.configured = !!this.config.inputSource;
    }

    const sourceStepCard = this.cards.find(card =>
      card.step === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG
      || card.step === ConnectorStepConfigs.STEP_SOURCE_APP_BASED
      || card.step === ConnectorStepConfigs.STEP_SOURCE_FTP_CONFIG
      || card.step === ConnectorStepConfigs.STEP_SOURCE_FUNCTION_CONFIG
    );
    if (sourceStepCard) {
      sourceStepCard.configured = this.isSourceStepConfigured();
      sourceStepCard.content = this.getSourceStepContent();
    }

    let selectorsCard = this.cards.find(card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
    if (!selectorsCard && this.hasFileInfo() && sourceStepCard) {
      this.ensureSelectorsCard();
      selectorsCard = this.cards.find(card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG);
    }
    if (selectorsCard) {
      selectorsCard.configured = this.hasFileInfo();
    }

    this.getTransformCards().forEach(card => {
      card.configured = !!card.id && this.transformer.has(card.id);
    });

    this.disableAddTransformer = !this.hasFileInfo() || this.getTransformCards().some(card => !card.configured);
  }

  private ensureSourceStepCard(): void {
    if (!this.config.inputSource) {
      return;
    }

    const stepCard: ConnectorCard = {
      index: 1,
      title: `${this.config.inputSource.title} ${this.translate.instant('SETTINGS')}`,
      configured: this.isSourceStepConfigured(),
      content: this.getSourceStepContent(),
      step: this.config.inputSource.configName,
      type: 'CONFIG'
    };

    if (this.cards.length > 1) {
      this.cards[1] = stepCard;
    } else {
      this.cards.push(stepCard);
    }
  }

  private ensureSelectorsCard(): void {
    const newCard: ConnectorCard = {
      index: 2,
      title: ` ${this.translate.instant('SPECIFY_HEADER')}`,
      configured: this.hasFileInfo(),
      step: ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
      type: 'CONFIG'
    };

    const existingIndex = this.cards.findIndex(
      card => card.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG
    );
    if (existingIndex >= 0) {
      this.cards[existingIndex] = {...newCard, index: existingIndex};
    } else {
      this.cards.splice(Math.min(2, this.cards.length), 0, newCard);
    }
    this.reAssignIndex();
  }

  private isSourceStepConfigured(): boolean {
    const inputConfig = this.config.inputConfig;
    if (!inputConfig) {
      return false;
    }

    if (isFileUploadSettings(inputConfig)) {
      return !!inputConfig.fileId;
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
    const inputConfig = this.config.inputConfig;
    if (!inputConfig) {
      return undefined;
    }

    if ('fileType' in inputConfig) {
      return `FileType: ${inputConfig.fileType ?? this.translate.instant('UNKNOWN')}`;
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

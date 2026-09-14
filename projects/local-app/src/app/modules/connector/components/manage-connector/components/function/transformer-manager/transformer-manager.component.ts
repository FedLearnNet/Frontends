import {Component, computed, effect, inject, OnInit, signal, untracked, viewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import {toSignal} from '@angular/core/rxjs-interop';

import {
  AppTransformerMappings,
  FunctionExecutionMode,
  FunctionsDetailDTO
} from '../../../../../dto/function';
import {ManageConnectorComponent} from '../../../manage-connector.component';

import {StoreConfig} from '@shared-lib/models';
import {FederatedAppType} from '@shared-lib/modules/store/dto/enum';
import {
  StoreSelectDialogComponent
} from '@shared-lib/modules/store/components/store-select-dialog/store-select-dialog.component';
import {StoreSelectDialogResult} from '@shared-lib/modules/store/components/model/model-select-dialog';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {StoreDTO} from '@shared-lib/modules/store/dto/store';
import {StoreActions} from '@shared-lib/modules/store/store/store.actions';
import {
  selectSelectedApp,
  selectStoreList,
  selectStoreLoading
} from '@shared-lib/modules/store/store/store.selectors';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';

import {TOOLS_TRANSFORMER_MODULE} from '../../../../../constansts/tools-transformer-module.constants';
import {
  AppRunTransformerRowMappingComponent
} from "@shared-lib/modules/app-execution/components/app-run-transformer-row-mapping/app-run-transformer-row-mapping.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {TransformerToolListItemComponent} from '../tool-list-item/tool-list-item.component';
import {modeDescriptionKey, modeIcon, modeLabelKey} from '../tool-list-item/transformer-mode';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";
import {SelectBtnComponent} from '@shared-lib/components/select-btn/select-btn.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';

export interface TransformerDialogData {
  functions: FunctionsDetailDTO[];
  columns: string[];
  patientIdColumn?: string;
  data?: FunctionsDetailDTO;
  errorMessage?: string;
}

type TransformerSource = 'builtin' | 'tools';

function isAppTransformer(transformer: FunctionsDetailDTO): boolean {
  return transformer.moduleName === TOOLS_TRANSFORMER_MODULE.moduleName
    || !!transformer.appImage
    || !!transformer.appVersionId;
}

@Component({
  selector: 'app-transformer-manager',
  standalone: true,
  templateUrl: './transformer-manager.component.html',
  styleUrl: './transformer-manager.component.scss',
  imports: [
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    TranslatePipe,
    ErrorCardComponent,
    AppRunTransformerRowMappingComponent,
    CloseableDialogTitleComponent,
    MarkdownComponent,
    TransformerToolListItemComponent,
    BadgeComponent,
    BtnComponent,
    SelectBtnComponent,
    KvComponent,
  ],
  providers: [provideMarkdown()],
})
export class ConnectorTransformerFunctionManagerComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly dialogRef = inject<MatDialogRef<ManageConnectorComponent>>(MatDialogRef);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly cfg: TransformerDialogData = inject<TransformerDialogData>(MAT_DIALOG_DATA);

  private readonly mapper = viewChild<AppRunTransformerRowMappingComponent>('mapper');

  readonly columns = signal<string[]>(this.cfg.columns ?? []);
  readonly functions = signal<FunctionsDetailDTO[]>(this.cfg.functions ?? []);

  readonly source = signal<TransformerSource>('builtin');
  readonly search = signal<string>('');
  readonly modeFilter = signal<FunctionExecutionMode | null>(null);

  readonly selectedFunction = signal<FunctionsDetailDTO | null>(null);

  private readonly storeItem = toSignal(this.store.select(selectSelectedApp));
  private readonly storeList = toSignal(this.store.select(selectStoreList), {initialValue: [] as StoreDTO[]});
  readonly storeLoading = toSignal(this.store.select(selectStoreLoading), {initialValue: false});

  readonly selectedTool = signal<AppDetailDto | null>(null);

  readonly configuredApp = signal<{ appImage?: string | null; appVersionId?: number | null } | null>(null);
  private readonly pendingToolId = signal<number | null>(null);
  private readonly pendingVersionId = signal<number | null>(null);

  readonly storeTools = computed(() => this.storeList().filter(item => !!item.app));

  readonly errorMessage = signal<string | null>(this.cfg.errorMessage ?? null);
  readonly hasError = computed(() => !!this.errorMessage());
  readonly patientIdColumn = signal<string | null>(this.cfg.patientIdColumn ?? null);
  readonly isPatientFunction = computed(() => this.selectedFunction()?.mode === FunctionExecutionMode.PATIENT);
  readonly hasPatientIdMapping = computed(() => !!this.patientIdColumn());

  mapping = signal<AppTransformerMappings>({} as AppTransformerMappings);

  readonly builtInFunctions = computed(() => this.functions()
    .filter(fn => fn.moduleName !== TOOLS_TRANSFORMER_MODULE.moduleName));

  readonly hasMultipleModules = computed(() =>
    new Set(this.builtInFunctions().map(fn => fn.moduleName)).size > 1);

  readonly availableModes = computed(() => {
    const modes = new Set(this.builtInFunctions().map(fn => fn.mode));
    return [FunctionExecutionMode.CELL, FunctionExecutionMode.ROW, FunctionExecutionMode.PATIENT]
      .filter(mode => modes.has(mode));
  });

  readonly filteredFunctions = computed(() => {
    const query = this.search().trim().toLocaleLowerCase();
    const mode = this.modeFilter();
    return this.builtInFunctions()
      .filter(fn => !mode || fn.mode === mode)
      .filter(fn => !query || [fn.methodName, fn.description, fn.mode, fn.moduleName]
        .some(value => value?.toLocaleLowerCase().includes(query)))
      .sort((a, b) => a.methodName.localeCompare(b.methodName));
  });

  readonly isToolsTransformer = computed(() => this.source() === 'tools');

  readonly hasSelection = computed(() =>
    this.isToolsTransformer()
      ? !!this.selectedTool() || !!this.configuredApp()
      : !!this.selectedFunction());

  readonly showsUnresolvedApp = computed(() =>
    this.isToolsTransformer() && !this.selectedTool() && !!this.configuredApp());

  readonly configuredAppName = computed(() => {
    const image = this.configuredApp()?.appImage;
    return image ? image.substring(image.lastIndexOf('/') + 1) : '';
  });

  readonly configuredMappingRows = computed(() => {
    const mapping = this.mapping() as AppTransformerMappings;
    return [
      ...Object.entries(mapping?.inputMapping ?? {}).map(([key, value]) => ({key, value, input: true})),
      ...Object.entries(mapping?.returnMapping ?? {}).map(([key, value]) => ({key, value, input: false})),
    ];
  });

  readonly storeConfig: StoreConfig = {
    hideWorkflow: true,
    prefilter: {appType: [FederatedAppType.DATA_TRANSFORMATION]},
    allowFilterChange: {appType: false},
  };

  readonly canApply = computed(() => {
    if (this.showsUnresolvedApp()) {
      return false;
    }
    const child = this.mapper();
    const patientSelectionIsValid = !this.isPatientFunction() || this.hasPatientIdMapping();
    return !!(child && child.isValid() && patientSelectionIsValid);
  });

  constructor() {
    effect(() => {
      const item = this.storeItem();
      if (!item) return;
      untracked(() => {
        const pendingApp = this.pendingToolId();
        if (pendingApp !== null) {
          if (item.id === pendingApp) {
            this.selectedTool.set(item);
            this.pendingToolId.set(null);
          }
          return;
        }
        const pendingVersion = this.pendingVersionId();
        if (pendingVersion !== null
          && (item.latestVersionId === pendingVersion || item.versions?.some(v => v.id === pendingVersion))) {
          this.selectedTool.set(item);
          this.pendingVersionId.set(null);
        }
      });
    });
  }

  ngOnInit(): void {
    const d = this.cfg.data;
    if (d) {
      if (isAppTransformer(d)) {
        this.source.set('tools');
        this.configuredApp.set({
          appImage: d.appImage ?? null,
          appVersionId: d.appVersionId ? Number(d.appVersionId) : null,
        });
        if (d.appVersionId) {
          this.pendingVersionId.set(Number(d.appVersionId));
          this.store.dispatch(StoreActions.loadAppByVersion({appVersionId: Number(d.appVersionId)}));
        }
      } else {
        this.selectedFunction.set(this.functions()
          .find(fn => fn.moduleName === d.moduleName && fn.methodName === d.methodName) ?? null);
      }
      this.mapping.set(d);
    }

    this.store.dispatch(StoreActions.loadList({
      params: {
        appTypes: [FederatedAppType.DATA_TRANSFORMATION],
        hideWorkflow: true,
        search: null,
        page: 0,
        size: 50,
      },
    }));
  }

  onSourceChange(source: TransformerSource): void {
    if (source === this.source()) return;
    this.source.set(source);
    this.selectedFunction.set(null);
    this.selectedTool.set(null);
    this.configuredApp.set(null);
    this.pendingToolId.set(null);
    this.pendingVersionId.set(null);
    this.search.set('');
    this.modeFilter.set(null);
    this.mapping.set({} as AppTransformerMappings);
    this.clearError();
  }

  isFunctionSelected(fn: FunctionsDetailDTO): boolean {
    const selected = this.selectedFunction();
    return selected?.moduleName === fn.moduleName && selected?.methodName === fn.methodName;
  }

  selectFunction(fn: FunctionsDetailDTO): void {
    if (this.isFunctionSelected(fn) || this.isPatientModeUnavailable(fn.mode)) return;
    this.selectedFunction.set(fn);
    this.mapping.set({} as AppTransformerMappings);
    this.clearError();
  }

  selectStoreTool(item: StoreDTO): void {
    const app = item.app;
    if (!app || this.selectedTool()?.id === app.id) return;
    this.configuredApp.set(null);
    this.pendingToolId.set(app.id);
    this.mapping.set({} as AppTransformerMappings);
    this.clearError();
    this.store.dispatch(StoreActions.loadApp({idOrSlug: app.id}));
  }

  isToolSelected(item: StoreDTO): boolean {
    const app = item.app;
    return !!app && (this.selectedTool()?.id === app.id || this.pendingToolId() === app.id);
  }

  setModeFilter(mode: FunctionExecutionMode | null): void {
    if (this.isPatientModeUnavailable(mode)) return;
    this.modeFilter.set(mode);
  }

  isPatientModeUnavailable(mode?: FunctionExecutionMode | null): boolean {
    return mode === FunctionExecutionMode.PATIENT && !this.hasPatientIdMapping();
  }

  onScopeFilterChange(value: FunctionExecutionMode | 'ALL' | undefined): void {
    this.setModeFilter(!value || value === 'ALL' ? null : value);
  }

  readonly modeIcon = modeIcon;

  modeLabel(mode?: FunctionExecutionMode | null): string {
    return this.translate.instant(modeLabelKey(mode));
  }

  modeDescription(mode?: FunctionExecutionMode | null): string {
    return this.translate.instant(modeDescriptionKey(mode));
  }

  showTools(): void {
    this.dialog.open(StoreSelectDialogComponent, {
      width: '980px',
      height: '100%',
      position: {top: '0', right: '0'},
      data: {storeConfig: this.storeConfig},
    }).afterClosed().subscribe((r?: StoreSelectDialogResult) => {
      if (!r?.app) return;
      this.configuredApp.set(null);
      this.pendingToolId.set(null);
      this.pendingVersionId.set(null);
      this.selectedTool.set(r.app);
      this.mapping.set({} as AppTransformerMappings);
      this.clearError();
    });
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  onDeleteClick(): void {
    this.dialogRef.close({delete: true});
  }

  cancel(): void {
    this.dialogRef.close();
  }

  apply(): void {
    const child = this.mapper();
    if (!child) {
      this.errorMessage.set(this.translate.instant('WARNING.PLEASE_FILL_REQUIRED_FIELDS'));
      return;
    }
    if (!this.canApply()) {
      this.errorMessage.set(this.translate.instant('WARNING.PLEASE_FILL_REQUIRED_FIELDS'));
      return;
    }
    child.submit();

    const fn = this.selectedFunction();
    const dto = this.mapping()!;

    if (this.isToolsTransformer()) {
      const tool = this.selectedTool();
      const configured = dto as AppTransformerMappings & Partial<FunctionsDetailDTO>;
      this.dialogRef.close({
        ...TOOLS_TRANSFORMER_MODULE,
        // The app's own name, so the step is recognisable in the wizard and in the preview.
        methodName: configured.methodName ?? tool?.name ?? TOOLS_TRANSFORMER_MODULE.methodName,
        ...dto,
        // Keep the pinned version and image of a step that is only being re-configured; picking a
        // different tool clears the mapping first, so the newly selected one wins then.
        appVersionId: configured.appVersionId ?? tool?.latestVersionId ?? null,
        appImage: configured.appImage ?? tool?.imageName ?? null,
      });
      return;
    }

    this.dialogRef.close({
      ...fn,
      ...dto,
    });
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('80vw', '84vh');
    }
  }
}

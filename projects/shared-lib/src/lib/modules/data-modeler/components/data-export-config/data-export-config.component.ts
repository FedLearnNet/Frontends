import {ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {
  StoreSelectDialogComponent
} from "@shared-lib/modules/store/components/store-select-dialog/store-select-dialog.component";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {MatDialog} from "@angular/material/dialog";
import {StoreConfig} from "@shared-lib/models";
import {toSignal} from "@angular/core/rxjs-interop";
import {selectSelectedApp} from "@shared-lib/modules/store/store/store.selectors";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {Store} from "@ngrx/store";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {TranslatePipe} from "@ngx-translate/core";
import {
  AppRunHyperparameterComponent
} from "@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {
  StoreAppConfigComponent
} from "@shared-lib/modules/store/components/store-app-config/store-app-config.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {
  StoreVersionListComponent
} from "@shared-lib/modules/store/components/store-version-list/store-version-list.component";
import {ToolConfigHyperParamDataType, ToolHyperParamConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {
  PatientDataExportConfigDTO,
  PatientDataPivotDuplicatePolicy,
  PatientDataPivotJoinField,
  PatientExportFilterDTO,
} from "@shared-lib/modules/data-modeler/dto/data-export.dto";
import {
  PatientFilterOption
} from "@shared-lib/modules/data-modeler/components/data-export-config-dialog/data-export-config-dialog.component";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";

interface KeyValue {
  key: string;
  value: string;
}

@Component({
  selector: 'lib-data-export-config',
  imports: [
    FormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    AppRunHyperparameterComponent,
    MatTab,
    MatTabGroup,
    StoreAppConfigComponent,
    StoreCardComponent,
    StoreVersionListComponent,

  ],
  templateUrl: './data-export-config.component.html',
  styleUrl: './data-export-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class DataExportConfigComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly store: Store = inject(Store);

  readonly config = model<PatientDataExportConfigDTO>({} as PatientDataExportConfigDTO);

  readonly showPatientFilter = input<boolean>(false);
  readonly patientOptions = input<PatientFilterOption[]>([]);
  readonly patientOptionsTruncated = input<boolean>(false);
  readonly allowAppBased = input<boolean>(true);

  readonly storeConfig: StoreConfig = {
    prefilter: {
      appType: [
        FederatedAppType.EXPORT,
      ],
    },
    allowFilterChange: {
      appType: false,
    },
  }

  private storeItem = toSignal(this.store.select(selectSelectedApp));

  selectedTool = signal<AppDetailDto | null | undefined>(null);
  hyperParamsValid = signal<boolean>(false);
  selectedVersion = computed(() => {
    const c = this.config();
    if (!c || !c.appBased) {
      return;
    }
    const app = this.selectedTool();
    if (!app) {
      return;
    }
    if (c.globalAppVersionId) {
      const usedVersion = app.versions.find(version => version.id === c.globalAppVersionId);
      if (usedVersion) {
        return usedVersion;
      }
    }
    return app.versions.find(version => version.id === app.latestVersionId)!;
  });

  readonly joinFieldOptions: KeyValue[] = [
    {key: PatientDataPivotJoinField.PATIENT_ID, value: 'Patient ID'},
    {key: PatientDataPivotJoinField.VISIT_ID, value: 'Visit ID'},
    {key: PatientDataPivotJoinField.VISIT_TIMESTAMP, value: 'Visit Timestamp'},
    {key: PatientDataPivotJoinField.VISIT_TIMESTAMP_FORMAT, value: 'Visit Timestamp Format'},
    {key: PatientDataPivotJoinField.IMPORT_SCHEMA_GROUP_ID, value: 'Import Schema Group ID'},
  ];

  readonly duplicatePolicyOptions: KeyValue[] = [
    {key: PatientDataPivotDuplicatePolicy.KEEP_FIRST, value: 'Keep First'},
    {key: PatientDataPivotDuplicatePolicy.KEEP_LAST, value: 'Keep Last'},
    {key: PatientDataPivotDuplicatePolicy.ERROR, value: 'Error'},
  ];

  constructor() {

    effect(() => {
      const c = this.config();
      if (c && c.appBased && c.globalAppVersionId) {
        const latestVersionId = this.storeItem()?.latestVersionId;
        if (latestVersionId && c.globalAppVersionId) {
          return;
        }
        this.store.dispatch(StoreActions.loadAppByVersion({appVersionId: c.globalAppVersionId}));
      }
    });

    effect(() => {
      const i = this.storeItem();
      if (i && i.id !== this.selectedTool()?.id) {
        this.selectedTool.set(i);
      }
    });
  }

  reset(): void {
    this.config.set({} as PatientDataExportConfigDTO);
  }

  setExternalPatientIds(ids: string[]): void {
    const selected = Array.isArray(ids) ? ids : [];
    this.updatePatientFilter({externalPatientIds: selected.length ? selected : undefined});
  }

  setPatientLimit(value: number | string | null): void {
    const limit = value === null || value === '' ? undefined : Number(value);
    this.updatePatientFilter({
      limit: limit !== undefined && Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : undefined
    });
  }

  private updatePatientFilter(patch: Partial<PatientExportFilterDTO>): void {
    this.config.update(d => {
      const filter: PatientExportFilterDTO = {...d.patientFilter, ...patch};
      const isEmpty = !filter.externalPatientIds?.length && filter.limit === undefined;
      return {...d, patientFilter: isEmpty ? undefined : filter};
    });
  }


  setAppBased(v: boolean): void {
    this.config.update(d => ({...d, appBased: !!v}));
  }

  setWideFormat(v: boolean): void {
    this.config.update(d => ({...d, wideFormat: !!v}));
  }

  setJoinFields(v: PatientDataPivotJoinField[]): void {
    this.config.update(d => ({...d, joinFields: Array.isArray(v) ? v : []}));
  }

  setDuplicatePolicy(v: PatientDataPivotDuplicatePolicy | null): void {
    this.config.update(d => ({...d, duplicatePolicy: v ?? undefined}));
  }

  setGlobalAppVersionId(v: number | null): void {
    const num = v == null ? undefined : Number(v);
    this.config.update(d => ({...d, globalAppVersionId: Number.isFinite(num as number) ? num : undefined}));
  }

  getHyperParamConfig(name: string): ToolHyperParamConfigDTO | undefined {
    if (!this.selectedVersion()) {
      return undefined;
    }
    return this.selectedVersion()?.appConfig?.hyperparams.find(h => {
      const n = h.variableName ? h.variableName : h.name;
      return n === name;
    });
  }

  onHyperParamsChanged(hyperParams: { [key: string]: any }) {
    const updatedHyperParams: { [key: string]: any } = {};

    for (const key in hyperParams) {
      const param = this.getHyperParamConfig(key);
      if (param) {
        if (param.type == ToolConfigHyperParamDataType.FLOAT || param.type == ToolConfigHyperParamDataType.INTEGER) {
          updatedHyperParams[key] = Number(hyperParams[key]);
        } else {
          updatedHyperParams[key] = hyperParams[key];
        }
      } else {
        updatedHyperParams[key] = hyperParams[key];
      }
    }

    this.config.update(n => ({
      ...n,
      hyperParams: updatedHyperParams
    }));
  }

  versionChanged(version: AppVersionDto | ModelVersionDto): void {
    if (!this.selectedTool()) {
      return;
    }
    this.config.update(u => ({
      ...u,
      globalAppVersionId: version.id,
    }));
  }

  onShowTools(): void {
    this.dialog.open(StoreSelectDialogComponent, {
      width: '980px',
      height: '100%',
      position: {
        top: '0',
        right: '0',
      },
      data: {
        storeConfig: this.storeConfig,
      },
    }).afterClosed().subscribe((result?: StoreSelectDialogResult) => {
      if (!result || !result.app) {
        return;
      }
      this.setGlobalAppVersionId(result.app.latestVersionId);
      this.selectedTool.set(result.app);
    });
  }
}

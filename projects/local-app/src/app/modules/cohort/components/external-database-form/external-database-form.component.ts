import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {finalize, map, Observable, of, switchMap} from 'rxjs';
import {CohortService} from '@local-app/cohort/services/cohort.service';
import {CohortDetailDto, ExternalDatabaseDto} from '@local-app/cohort/models';
import {StoreService} from '@shared-lib/modules/store/store/store.service';
import {ToolHyperParamConfigDTO} from '@shared-lib/modules/app-execution/dto/config';
import {
  StoreSelectDialogComponent
} from '@shared-lib/modules/store/components/store-select-dialog/store-select-dialog.component';
import {StoreSelectDialogData} from '@shared-lib/modules/store/model/store-select-dialog';
import {StoreSelectDialogResult} from '@shared-lib/modules/store/components/model/model-select-dialog';
import {FederatedAppType} from '@shared-lib/modules/store/dto/enum';
import {AppVersionDto} from '@shared-lib/modules/store/dto/app-version';
import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {ExternalDatabaseAccess, ExternalDatabaseType} from '@shared-lib/modules/workflow/dto/tre-source';

interface ExternalDatabaseFormData {
  cohort?: CohortDetailDto;
}

interface DatabaseType {
  value: ExternalDatabaseType;
  label: string;
  icon: string;
  port?: number;
}

@Component({
  selector: 'app-external-database-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatSlideToggleModule, MatExpansionModule, MatCheckboxModule, MatButtonToggleModule],
  templateUrl: './external-database-form.component.html',
  styleUrl: './external-database-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalDatabaseFormComponent {
  private readonly cohortService = inject(CohortService);
  private readonly storeService = inject(StoreService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly dialogRef = inject(MatDialogRef<ExternalDatabaseFormComponent>, {optional: true});
  readonly data = inject<ExternalDatabaseFormData>(MAT_DIALOG_DATA, {optional: true}) ?? {};

  readonly types: DatabaseType[] = [
    {value: 'NEO4J', label: 'Neo4j', icon: 'hub', port: 7687},
    {value: 'POSTGRES', label: 'PostgreSQL', icon: 'storage', port: 5432},
    {value: 'MYSQL', label: 'MySQL', icon: 'storage', port: 3306},
    {value: 'MONGODB', label: 'MongoDB', icon: 'data_object', port: 27017},
    {value: 'OTHER', label: 'Other', icon: 'more_horiz'},
  ];
  private readonly dialog = inject(MatDialog);
  readonly hyperParams = signal<ToolHyperParamConfigDTO[]>([]);
  readonly showPassword = signal(false);
  // picked to replace the stored test data file; removed drops the stored one
  readonly testFile = signal<File | null>(null);
  readonly testFileRemoved = signal(false);
  readonly dragging = signal(false);
  readonly saving = signal(false);

  private readonly db: Partial<ExternalDatabaseDto> = this.data.cohort?.externalDatabase ?? {};
  readonly form = inject(FormBuilder).nonNullable.group({
    name: [this.data.cohort?.name ?? '', [Validators.required, Validators.maxLength(80)]],
    description: [this.data.cohort?.description ?? '', [Validators.required, Validators.maxLength(1000)]],
    type: [this.db.type ?? 'NEO4J', Validators.required],
    location: [this.db.location ?? 'CONTAINER'],
    host: [this.db.host ?? '', Validators.required],
    port: [this.db.port ?? 7687, [Validators.required, Validators.min(1), Validators.max(65535)]],
    database: [this.db.database ?? ''],
    username: [this.db.username ?? ''],
    password: [''],
    env: [Object.entries(this.db.env ?? {}).map(([key, value]) => `${key}=${value}`).join('\n')],
    access: [(this.db.access ?? 'DIRECT') as ExternalDatabaseAccess],
    toolVersionId: [this.db.toolVersionId as number | undefined],
    testData: [this.db.testData ?? '', Validators.maxLength(262144)],
    synthetic: [!!this.db.testData],
  });
  private readonly value = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    {initialValue: this.form.getRawValue()});
  readonly values = signal<Record<string, unknown>>({...(this.db.hyperParams ?? {})});
  readonly tool = signal<{ versionId: number; name: string } | null>(
    this.db.toolVersionId ? {versionId: this.db.toolVersionId, name: this.db.toolName ?? ''} : null);
  readonly versions = signal<AppVersionDto[]>([]);

  readonly canSave = computed(() => {
    const value = this.value();
    return !this.saving() && this.form.valid && (value.access === 'DIRECT' || !!value.toolVersionId)
      && (!this.hasTestData() || value.synthetic);
  });
  readonly storedFile = computed(() => this.testFileRemoved() ? undefined : this.db.testDataFile);
  readonly hasTestData = computed(() => !!this.value().testData.trim() || !!this.testFile() || !!this.storedFile());

  readonly envPreview = computed(() => {
    const value = this.value();
    // an address reaches the tool through the orchestration's forwarder
    const host = value.location === 'ADDRESS' ? 'flnet-db' : value.host || '<container>';
    return [
      `FLNET_DB_TYPE=${value.type}`,
      `FLNET_DB_HOST=${host}`,
      `FLNET_DB_PORT=${value.port}`,
      `FLNET_DB_NAME=${value.database}`,
      `FLNET_DB_USER=${value.username}`,
      `FLNET_DB_PASSWORD=••••••`,
      ...value.env.split('\n').filter(line => line.includes('=')),
    ].join('\n');
  });

  constructor() {
    if (this.db.toolVersionId) {
      this.storeService.getAppVersion(this.db.toolVersionId).subscribe(app => this.showTool(app, this.db.toolVersionId!));
    }
  }

  selectType(type: DatabaseType): void {
    this.form.patchValue({type: type.value, ...(type.port ? {port: type.port} : {})});
  }

  // a version of another tool or version starts without fixed hyper parameters
  pickVersion(versionId: number, name = this.tool()?.name ?? ''): void {
    if (versionId !== this.tool()?.versionId) {
      this.values.set({});
    }
    this.tool.set({versionId, name});
    this.form.patchValue({toolVersionId: versionId});
    this.hyperParams.set(this.versions().find(version => version.id === versionId)?.appConfig?.hyperparams ?? []);
  }

  private showTool(app: AppDetailDto, versionId: number): void {
    this.versions.set(app.versions ?? []);
    this.tool.set({versionId, name: app.name});
    this.hyperParams.set(app.versions?.find(version => version.id === versionId)?.appConfig?.hyperparams
      ?? app.appConfig?.hyperparams ?? []);
  }

  // the store, only with extractors, as they read a database
  chooseTool(): void {
    this.dialog.open(StoreSelectDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {
        storeConfig: {
          hideWorkflow: true,
          onlyWithImage: true,
          prefilter: {appType: [FederatedAppType.EXTRACTOR]},
          allowFilterChange: {appType: false},
        },
        title: 'MENU.SELECT_TOOL',
        allowMaximize: true,
      } as StoreSelectDialogData,
    }).afterClosed().subscribe((result?: StoreSelectDialogResult) => {
      // a trained model locks the tool it was trained with
      const appId = result?.app?.id ?? result?.model?.federatedAppId;
      if (appId == null) {
        return;
      }
      this.storeService.getApp(appId).subscribe(app => {
        this.versions.set(app.versions ?? []);
        this.pickVersion(app.latestVersionId, app.name);
      });
    });
  }

  isFixed(param: ToolHyperParamConfigDTO): boolean {
    return param.name in this.values();
  }

  toggleFixed(param: ToolHyperParamConfigDTO, fixed: boolean): void {
    const values = {...this.values()};
    if (fixed) {
      values[param.name] = param.default ?? '';
    } else {
      delete values[param.name];
    }
    this.values.set(values);
  }

  setValue(param: ToolHyperParamConfigDTO, value: string): void {
    const numeric = param.type === 'INTEGER' || param.type === 'FLOAT';
    this.values.set({...this.values(), [param.name]: numeric && value !== '' ? Number(value) : value});
  }

  pickTestFile(file?: File | null): void {
    this.dragging.set(false);
    if (file) {
      this.testFile.set(file);
    }
  }

  removeTestFile(): void {
    if (this.testFile()) {
      this.testFile.set(null);
    } else {
      this.testFileRemoved.set(true);
    }
  }

  sizeOf(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  cancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.location.back();
    }
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    const raw = this.form.getRawValue();
    const tool = raw.access === 'TOOL' ? this.tool() ?? undefined : undefined;
    const externalDatabase: ExternalDatabaseDto = {
      type: raw.type, location: raw.location, host: raw.host.trim(), port: Number(raw.port), database: raw.database || undefined,
      username: raw.username || undefined, password: raw.password || undefined,
      env: Object.fromEntries(raw.env.split('\n').filter(line => line.includes('='))
        .map(line => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()])),
      access: raw.access, toolVersionId: tool?.versionId, toolName: tool?.name, hyperParams: tool ? this.values() : undefined,
      testData: raw.testData.trim() || undefined,
    };
    const cohort = this.data.cohort;
    const name = raw.name.trim();
    this.saving.set(true);
    const request = cohort
      ? this.cohortService.updateCohort({...cohort, name, description: raw.description, externalDatabase})
      : this.cohortService.createCohort({name, description: raw.description, externalDatabase});
    request.pipe(
      switchMap(saved => this.saveTestFile(saved.id).pipe(map(() => saved))),
      finalize(() => this.saving.set(false)),
    ).subscribe({
      next: saved => {
        if (this.dialogRef) {
          this.dialogRef.close(saved);
        } else {
          this.router.navigate(['/cohort', saved.id]);
        }
      },
    });
  }

  private saveTestFile(cohortId: number): Observable<unknown> {
    const file = this.testFile();
    if (file) {
      return this.cohortService.uploadTestData(cohortId, file);
    }
    return this.testFileRemoved() && this.db.testDataFile ? this.cohortService.deleteTestData(cohortId) : of(null);
  }
}

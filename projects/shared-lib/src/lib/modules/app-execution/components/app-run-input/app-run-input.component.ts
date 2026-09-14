import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbar} from '@angular/material/toolbar';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatDividerModule} from '@angular/material/divider';

import {Store} from '@ngrx/store';
import {EMPTY, firstValueFrom, Observable, Subscription} from 'rxjs';

import {AppDetailDto} from '@shared-lib/modules/store/dto/app-detail';
import {AppVersionDto} from '@shared-lib/modules/store/dto/app-version';
import {
  ToolConfigDataType,
  ToolConfigDTO,
  ToolConfigModeType,
  ToolInputConfigDTO,
} from '@shared-lib/modules/app-execution/dto/config';

import {
  AppInputInputComponent
} from '@shared-lib/modules/app-execution/components/app-input-input/app-input-input.component';

import {DataAnalysisFileDTO} from '@shared-lib/modules/app-execution/dto/model-workflow-file';
import {ModelWorkflowUploadFileResponse} from '@shared-lib/modules/app-execution/model/model-workflow-file';
import {WorkflowDTO} from '@shared-lib/modules/workflow/dto/workflow.dto';

import {DataAnalysisActions} from '@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions';
import {
  selectDataAnalysisCurrentUploadByFileId
} from '@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors';

import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {
  RemoteToolInputValidationService
} from "../../../../../../../global-app/src/app/modules/tool-development/service/tool-input-validation.service";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";


@Component({
  selector: 'lib-app-run-input',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    AppInputInputComponent,
    ErrorCardComponent,
    MatToolbar,
    AsyncPipe,
    MatProgressBar,
    SkeletonLoaderComponent,
  ],
  templateUrl: './app-run-input.component.html',
  styleUrl: './app-run-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRunInputComponent implements OnInit, AfterViewInit {
  private readonly store: Store = inject(Store);
  private readonly remoteValidationService = inject(RemoteToolInputValidationService);
  protected readonly FILE_PREFIX = "file://";

  app = input<AppDetailDto>();
  version = input<AppVersionDto>();
  workflow = input<WorkflowDTO>();
  dynamicInputs = input<{ [key: string]: any }>({});
  workflowFiles = input<DataAnalysisFileDTO[]>();

  allowMods = input<ToolConfigModeType[]>([
    ToolConfigModeType.BOTH,
    ToolConfigModeType.PREDICTION
  ]);
  allowMultiple = input<boolean>(false);

  directUploadToWorkflow = input<number | undefined>(undefined);
  currentUpload: ToolInputConfigDTO | undefined = undefined;
  currentUploadResult: DataAnalysisFileDTO | undefined = undefined;
  uploadResponse$: Observable<ModelWorkflowUploadFileResponse> = EMPTY;
  uploadSub: Subscription;

  inputChanged = output<{ [key: string]: any }>();
  multiInputsChanged = output<{ [key: string]: any[] }>();
  formsValid = output<boolean>();

  inputs = linkedSignal(() => this.dynamicInputs());
  currentCustom = signal<number>(-1);
  private readonly fileErrorsByKey = signal<Record<string, string[]>>({});
  private readonly fileValidatedAtByKey = signal<Record<string, Date | null>>({});
  private readonly fileValidatingByKey = signal<Record<string, boolean>>({});
  private readonly fileValidateTrigger = signal(0);

  allValid: { [key: string]: any } = {};
  multiInputs: { [key: string]: any[] } = {};


  private readonly currentToolConfig = computed<ToolConfigDTO | null>(() => {
    const cfg =
      (this.app()?.appConfig as any) ??
      (this.version()?.appConfig as any) ??
      ((this.workflow() as any)?.appConfig as any);

    return (cfg ?? null) as ToolConfigDTO | null;
  });

  constructor() {
    effect(() => {
      this.app();
      this.version();
      this.workflow();
      this.fileErrorsByKey.set({});
      this.fileValidatedAtByKey.set({});
      this.fileValidatingByKey.set({});
      this.fileValidateTrigger.update(v => v + 1);
    });

    effect(async () => {
      this.fileValidateTrigger();

      const cfg = this.currentToolConfig();
      if (!cfg) return;

      for (const input of this.getInputs()) {
        if (!this.isFile(input)) continue;

        const key = this.getInputName(input);
        const value = this.inputs()[key];
        const workflowFileId = this.extractFileId(value);

        if (!workflowFileId) {
          this.setFileValidationState(key, [], null, false);
          continue;
        }
        const file = this.workflowFiles()?.find(w => w.id === workflowFileId);
        const fileId = file?.file?.id ?? null;

        if (!fileId) {
          this.setFileValidationState(key, [], null, false);
          continue;
        }
        this.setFileValidating(key, true);
        try {
          const res = await firstValueFrom(this.remoteValidationService.validateFile(fileId, input));
          const errors = res?.errors ?? [];
          this.setFileValidationState(key, errors, new Date(), false);

          this.allValid[key] = errors.length === 0;
          this.formsValid.emit(Object.values(this.allValid).every(v => v));
        } catch (_e) {
          this.setFileValidationState(key, ['Remote validation failed.'], new Date(), false);
          this.allValid[key] = false;
          this.formsValid.emit(Object.values(this.allValid).every(v => v));
        }
      }
    });
  }

  ngOnInit(): void {
    this.createDynamicHyperparams();
  }

  ngAfterViewInit() {
    const data = this.inputs();
    this.getInputs().forEach(i => {
      data[this.getInputName(i)] = this.getInputValueWorkflowFiles(i);
    });
    this.inputs.set(data);
    this.inputChanged.emit(data);

    this.fileValidateTrigger.update(v => v + 1);
  }

  getInputs(): ToolInputConfigDTO[] {
    if (this.app()) {
      return this.app()?.appConfig.input.filter((input) => this.inputModeApplies(input)) ?? [];
    }
    if (this.version()) {
      return this.version()?.appConfig.input.filter((input) => this.inputModeApplies(input)) ?? [];
    }
    if (this.workflow()) {
      return this.workflow()?.inputs ?? [];
    }
    return [];
  }

  inputModeApplies(input: ToolInputConfigDTO): boolean {
    if (this.allowMods().includes(ToolConfigModeType.BOTH)) return true;
    if (this.allowMods().includes(ToolConfigModeType.TRAINING) && input.mode === ToolConfigModeType.TRAINING) return true;
    return this.allowMods().includes(ToolConfigModeType.PREDICTION) && input.mode === ToolConfigModeType.PREDICTION;
  }

  enableCustom(index: number) {
    this.currentCustom.set(index);
  }

  private getInputName(input: ToolInputConfigDTO): string {
    return input.variableName ? input.variableName : input.name;
  }

  public isFile(input: ToolInputConfigDTO): boolean {
    return input.type === ToolConfigDataType.CSV || input.type === ToolConfigDataType.TSV
      || input.type === ToolConfigDataType.PATH || input.type === ToolConfigDataType.IMAGE
      || input.type === ToolConfigDataType.JSON || input.type === ToolConfigDataType.TEXT
      || input.type === ToolConfigDataType.HTML || input.type === ToolConfigDataType.MIXED;
  }

  private createDynamicHyperparams() {
    if (this.app() || this.version()) {
      const data = this.inputs();
      this.getInputs().forEach(inp => {
        data[this.getInputName(inp)] = undefined;
      });
      this.inputs.set(data);
      this.inputChanged.emit(this.inputs());
    }
  }

  public validateForms(input: ToolInputConfigDTO, value: boolean) {
    this.allValid[this.getInputName(input)] = value;
    this.formsValid.emit(Object.values(this.allValid).every((v) => v));
  }

  public getInputValue(input: ToolInputConfigDTO): string {
    return this.inputs()[this.getInputName(input)];
  }

  public getInputValueWorkflowFiles(input: ToolInputConfigDTO): string | undefined {
    const files = this.workflowFiles();
    if (files && files.length > 0) {
      if (this.currentUploadResult && this.currentUpload && input.name === this.currentUpload.name) {
        return this.FILE_PREFIX + this.currentUploadResult.id;
      }
      return this.FILE_PREFIX + files[0].id;
    }
    return undefined;
  }

  public emitMultiInputChanged(input: ToolInputConfigDTO, values: string[]) {
    this.multiInputs[this.getInputName(input)] = values;
    this.multiInputsChanged.emit(this.multiInputs);
  }

  public emitInputChanged(input: ToolInputConfigDTO, value: string) {
    const data = this.inputs();
    data[this.getInputName(input)] = value;
    this.inputs.set(data);
    this.inputChanged.emit(data);

    this.fileValidateTrigger.update(v => v + 1);

    this.uploadFile(value as any, input);
  }

  uploadFile(files: Array<any>, input: ToolInputConfigDTO): void {
    if (!this.directUploadToWorkflow() && files.length === 0) return;

    const file = files?.[0];
    if (!file) return;

    this.currentUpload = input;

    const hash = this.generateHash(this.currentUpload);
    this.store.dispatch(DataAnalysisActions.uploadFileWithFileId({
      dataAnalysisId: this.directUploadToWorkflow()!,
      fileId: hash,
      file
    }));

    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
    }

    this.uploadResponse$ = this.store.select(selectDataAnalysisCurrentUploadByFileId(hash));
    this.uploadSub = this.uploadResponse$.subscribe((res) => {
      if (res.result) {
        this.currentUploadResult = res.result;

        if (this.currentUpload) {
          const key = this.getInputName(this.currentUpload);
          const data = this.inputs();
          data[key] = this.FILE_PREFIX + res.result.id;
          this.inputs.set(data);
          this.inputChanged.emit(data);

          this.fileValidateTrigger.update(v => v + 1);
        }
      }
    });
  }

  generateHash(input: ToolInputConfigDTO): number {
    let hash = 0;
    for (const char of input.name) {
      hash = (hash << 5) - hash + char.charCodeAt(0);
      hash |= 0;
    }
    return hash;
  }

  private extractFileId(value: any): number | null {
    if (value == null) return null;

    if (typeof value === 'string' && value.startsWith(this.FILE_PREFIX)) {
      const n = Number(value.replace(this.FILE_PREFIX, ''));
      return Number.isFinite(n) ? n : null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    return null;
  }

  private setFileValidating(key: string, validating: boolean) {
    this.fileValidatingByKey.update(m => ({...m, [key]: validating}));
  }

  private setFileValidationState(key: string, errors: string[], validatedAt: Date | null, validating: boolean) {
    this.fileErrorsByKey.update(m => ({...m, [key]: errors}));
    this.fileValidatedAtByKey.update(m => ({...m, [key]: validatedAt}));
    this.fileValidatingByKey.update(m => ({...m, [key]: validating}));
  }

  fileErrorMessages(input: ToolInputConfigDTO): string[] {
    return this.fileErrorsByKey()[this.getInputName(input)] ?? [];
  }

  fileHasErrors(input: ToolInputConfigDTO): boolean {
    return this.fileErrorMessages(input).length > 0;
  }

  fileLastValidatedAt(input: ToolInputConfigDTO): Date | null {
    return this.fileValidatedAtByKey()[this.getInputName(input)] ?? null;
  }

  fileValidatingRemote(input: ToolInputConfigDTO): boolean {
    return this.fileValidatingByKey()[this.getInputName(input)] ?? false;
  }

  fileIsValid(input: ToolInputConfigDTO): boolean {
    return !this.fileHasErrors(input) && !!this.fileLastValidatedAt(input);
  }
}

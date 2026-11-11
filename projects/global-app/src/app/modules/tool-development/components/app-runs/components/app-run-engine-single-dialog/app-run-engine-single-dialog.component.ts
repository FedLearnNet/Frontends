import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatTooltip} from "@angular/material/tooltip";
import {MatOption, MatSelect} from "@angular/material/select";
import {finalize} from "rxjs";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {FileService} from "@shared-lib/modules/files/store/file.service";
import {ToolInputConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {
  AppRunHyperparameterComponent
} from "@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";
import {BytesPipe} from "@shared-lib/pipies/bytes.pipe";
import {TestEngineService} from "../../../../service/test-engine.service";
import {TestEngineMode} from "../../../../dto/test-engine";
import * as TestEngineActions from "../../../../store/test-engine.actions";
import {Store} from "@ngrx/store";

export interface AppRunEngineSingleDialogData {
  app: AppDetailDto;
}

// One test run of the built image, its inputs picked from the file store
@Component({
  selector: 'app-app-run-engine-single-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatFormField,
    MatLabel,
    MatHint,
    MatTooltip,
    MatSelect,
    MatOption,
    AppRunHyperparameterComponent,
    HintCardComponent,
    BytesPipe,
  ],
  templateUrl: './app-run-engine-single-dialog.component.html',
  styleUrl: './app-run-engine-single-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRunEngineSingleDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AppRunEngineSingleDialogComponent>);
  private readonly fileService = inject(FileService);
  private readonly engineService = inject(TestEngineService);
  private readonly store = inject(Store);
  readonly data = inject<AppRunEngineSingleDialogData>(MAT_DIALOG_DATA);

  readonly files = signal<FileDTO[]>([]);
  readonly selected = signal<{ [variable: string]: FileDTO | undefined }>({});
  readonly hyperParams = signal<{ [key: string]: any }>({});
  readonly hyperParamsValid = signal(true);
  readonly starting = signal(false);

  readonly inputConfigs: ToolInputConfigDTO[] = this.data.app.appConfig?.input ?? [];
  // Why the run cannot start yet; empty when it can
  readonly runHint = computed(() => {
    if (this.starting()) return 'Starting…';
    const missing = this.inputConfigs.filter(config => config.required && !this.selected()[this.variableOf(config)]);
    if (missing.length) return 'Choose a file for ' + missing.map(config => config.name).join(', ');
    if (!this.hyperParamsValid()) return 'Some hyperparameters are not valid';
    return '';
  });

  ngOnInit(): void {
    this.fileService.listFiles().subscribe(files => this.files.set(files));
  }

  variableOf(config: ToolInputConfigDTO): string {
    return config.variableName ?? config.name;
  }

  select(config: ToolInputConfigDTO, file: FileDTO | undefined): void {
    this.selected.update(selected => ({...selected, [this.variableOf(config)]: file}));
  }

  start(): void {
    if (this.runHint()) return;
    const inputs: { [key: string]: unknown } = {};
    Object.entries(this.selected()).forEach(([variable, file]) => {
      // The engine downloads the file through its secret link
      if (file?.downloadUrl) inputs[variable] = `${file.downloadUrl}/download?secret=${file.secret}`;
    });
    this.starting.set(true);
    this.engineService.start(this.data.app.id, {
      mode: TestEngineMode.SINGLE_RUN,
      testRun: {
        federatedAppVersionId: this.data.app.latestVersionId,
        hyperParams: this.hyperParams(),
        inputs,
      },
    }).pipe(
      finalize(() => this.starting.set(false)),
    ).subscribe(engine => {
      this.store.dispatch(TestEngineActions.startTestEngineSuccess({engine}));
      this.dialogRef.close(true);
    });
  }
}

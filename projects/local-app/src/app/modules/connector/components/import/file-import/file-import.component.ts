import {Component, computed, effect, inject, input, output, signal, untracked} from '@angular/core';
import {Store} from '@ngrx/store';
import {UploadFileAreaComponent} from '@shared-lib/modules/files/components/upload-file-area/upload-file-area.component';
import {ImportActivity, ImportResultDTO, isImportFinished} from '../../../dto/import-progress';
import {ImportUploadSettings} from '../../../dto/connector-import';
import {ImportActions} from '../../../store/import/import.actions';
import {adoptableImport, selectAllImports} from '../../../store/import/import.selectors';
import {ImportActivityComponent} from '../import-activity/import-activity.component';

export interface FileImportResult {
  result: ImportResultDTO;
}


@Component({
  selector: 'app-file-import',
  imports: [UploadFileAreaComponent, ImportActivityComponent],
  templateUrl: './file-import.component.html',
  styleUrl: './file-import.component.scss',
})
export class FileImportComponent {

  private readonly store = inject(Store);

  readonly cohortId = input.required<number>();
  readonly connectorId = input<number | undefined>(undefined);
  readonly settings = input<ImportUploadSettings>({});
  readonly accept = input<string>('');
  readonly supportFile = input<boolean>(false);
  readonly label = input<string>('DIALOG.DRAG_AND_DROP_FILES');
  readonly autoStart = input<boolean>(true);

  readonly showPicker = input<boolean>(true);

  readonly fileSelected = output<File>();
  readonly completed = output<FileImportResult>();
  readonly failed = output<string>();

  readonly file = signal<File | undefined>(undefined);

  private readonly importId = signal<string | undefined>(undefined);
  private readonly imports = this.store.selectSignal(selectAllImports);
  private readonly adopted = computed(() =>
    adoptableImport(this.imports(), this.cohortId(), this.connectorId()));

  readonly activity = computed(() => {
    const importId = this.importId() ?? this.adopted()?.importId;
    return importId ? this.imports().find(activity => activity.importId === importId) : undefined;
  });

  readonly busy = computed(() => {
    const activity = this.activity();
    return !!activity && !isImportFinished(activity.phase);
  });

  private reported?: string;

  private readonly reportWhenFinished = effect(() => {
    const activity = this.activity();
    if (!activity?.finishedAt || untracked(() => this.reported) === activity.importId) {
      return;
    }
    this.reported = activity.importId;
    untracked(() => this.report(activity));
  });

  selectFile(file: File): void {
    if (this.busy()) {
      return;
    }
    this.file.set(file);
    this.fileSelected.emit(file);
    if (this.autoStart()) {
      this.start();
    }
  }

  importFile(file: File): void {
    this.file.set(file);
    this.fileSelected.emit(file);
    this.start();
  }

  start(): void {
    const file = this.file();
    if (!file || this.busy()) {
      return;
    }
    const importId = crypto.randomUUID();
    this.reported = undefined;
    this.importId.set(importId);
    this.store.dispatch(ImportActions.startImport({
      request: {
        importId,
        cohortId: this.cohortId(),
        connectorId: this.connectorId(),
        file,
        settings: this.settings(),
        supportFile: this.supportFile(),
      },
    }));
  }

  cancel(): void {
    const importId = this.importId();
    if (importId) {
      this.store.dispatch(ImportActions.cancelImport({importId}));
    }
    this.importId.set(undefined);
  }

  clear(): void {
    this.cancel();
    this.file.set(undefined);
  }

  dismiss(): void {
    const importId = this.importId() ?? this.adopted()?.importId;
    if (importId) {
      this.store.dispatch(ImportActions.dismissImport({importId}));
    }
    this.importId.set(undefined);
  }

  private report(activity: ImportActivity): void {
    if (activity.result) {
      this.completed.emit({result: activity.result});
      return;
    }
    this.failed.emit(activity.error ?? 'The file could not be imported.');
  }
}

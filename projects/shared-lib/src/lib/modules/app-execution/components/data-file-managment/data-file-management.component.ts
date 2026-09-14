import {Component, computed, effect, inject} from '@angular/core';
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatIcon} from "@angular/material/icon";
import {JsonPipe} from "@angular/common";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {Store} from "@ngrx/store";
import {MatDialog} from "@angular/material/dialog";
import {
  FileDetailDialogComponent
} from "@shared-lib/modules/files/components/file-detail-dialog/file-detail-dialog.component";
import {
  selectDataAnalysisCurrentUploadForCurrentWorkflow,
  selectDataAnalysisFileError,
  selectDataAnalysisFileLoading,
  selectDataAnalysisFilesForSelectedWorkflow,
  selectSelectedDataAnalysis
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {MatTooltip} from "@angular/material/tooltip";
import {
  SelectFileDialogComponent
} from "../../../../../../../global-app/src/app/modules/files/components/select-file-dialog/select-file-dialog.component";
import {FileDTO} from "@shared-lib/modules/files/dto/file";

@Component({
  selector: 'lib-model-workflow-data-file-management',
  imports: [
    MatProgressBar,
    MatIcon,
    MatIconButton,
    MatToolbar,
    JsonPipe,
    MatTooltip
  ],
  templateUrl: './data-file-management.component.html',
  styleUrl: './data-file-management.component.scss'
})
export class DataFileManagementComponent {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog)

  dataAnalysisState = this.store.selectSignal(selectSelectedDataAnalysis);

  workflow = computed(() => this.dataAnalysisState()?.detail);
  dataAnalysisId = computed(() => this.workflow()?.id);

  files = this.store.selectSignal(selectDataAnalysisFilesForSelectedWorkflow);
  uploadResponse = this.store.selectSignal(selectDataAnalysisCurrentUploadForCurrentWorkflow);
  loading = this.store.selectSignal(selectDataAnalysisFileLoading);
  error = this.store.selectSignal(selectDataAnalysisFileError);

  showUpload = false;
  dragOver = false;

  loadFilesEffect = effect(() => {
    const dataAnalysisId = this.dataAnalysisId();
    if (dataAnalysisId) {
      this.store.dispatch(DataAnalysisActions.loadFiles({dataAnalysisId: dataAnalysisId}));
    }
  })

  openDetailDialog(file: DataAnalysisFileDTO): void {
    this.dialog.open(FileDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: file.file
    });
  }

  toggleUpload(): void {
    this.showUpload = !this.showUpload;
  }

  linkFile() {
    if (!this.dataAnalysisId()) {
      return;
    }
    this.dialog.open(SelectFileDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    }).afterClosed().subscribe((result?: FileDTO) => {
      if (result) {
        this.store.dispatch(DataAnalysisActions.linkFile({dataAnalysisId: this.dataAnalysisId()!, fileId: result.id}));
      }
    })
  }

  onDragEnter(): void {
    this.dragOver = true;
  }

  onDragLeave(): void {
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    const dataAnalysisId = this.dataAnalysisId();
    if (file && dataAnalysisId) {
      this.store.dispatch(DataAnalysisActions.uploadFile({dataAnalysisId, file}));
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const dataAnalysisId = this.dataAnalysisId();
    if (file && dataAnalysisId) {
      this.store.dispatch(DataAnalysisActions.uploadFile({dataAnalysisId, file}));
    }
  }

  delete(file: DataAnalysisFileDTO): void {
    const dataAnalysisId = this.dataAnalysisId();
    if (dataAnalysisId && file.id) {
      this.store.dispatch(DataAnalysisActions.deleteFile({dataAnalysisId, fileId: file.id}));
    }
  }
}

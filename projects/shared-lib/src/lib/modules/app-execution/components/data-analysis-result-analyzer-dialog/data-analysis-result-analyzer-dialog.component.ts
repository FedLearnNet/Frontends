import {Component, computed, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataAnalysisResultAnalyzerDialogData} from "@shared-lib/modules/app-execution/model/data-analyzer";
import {Store} from "@ngrx/store";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {selectResultAnalysisItem} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {MatIconButton} from "@angular/material/button";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {MatIcon} from "@angular/material/icon";
import {
  FileDetailCardComponent
} from "@shared-lib/modules/files/components/file-detail-card/file-detail-card.component";

@Component({
  selector: 'lib-data-analysis-result-analyzer-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MarkdownComponent,
    SkeletonLoaderComponent,
    ErrorCardComponent,
    TimeBadgeComponent,
    MatIconButton,
    MatIcon,
    FileDetailCardComponent
  ],
  templateUrl: './data-analysis-result-analyzer-dialog.component.html',
  styleUrl: './data-analysis-result-analyzer-dialog.component.scss',
  providers: [
    provideMarkdown(),
  ],
})
export class DataAnalysisResultAnalyzerDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DataAnalysisResultAnalyzerDialogComponent>);
  readonly data = inject<DataAnalysisResultAnalyzerDialogData>(MAT_DIALOG_DATA);
  private readonly store: Store = inject(Store);

  resultState = this.store.selectSignal(selectResultAnalysisItem(this.data.dataAnalysisId, this.data.fileId));

  markdown = computed(() => {
    const state = this.resultState();
    return state.result?.result;
  });

  ngOnInit(): void {
    this.generate();
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  generate() {
    if (this.data.dataAnalysisId === undefined || this.data.fileId === undefined) {
      this.store.dispatch(DataAnalysisActions.analyzeResultFailure({
        dataAnalysisId: this.data.dataAnalysisId,
        fileId: this.data.fileId,
        error: "Can not load, ids empty"
      }));
      return;
    }
    this.store.dispatch(DataAnalysisActions.analyzeResult({
      dataAnalysisId: this.data.dataAnalysisId,
      fileId: this.data.fileId
    }));
  }
}

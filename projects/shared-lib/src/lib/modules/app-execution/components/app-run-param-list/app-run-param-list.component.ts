import {Component, computed, inject, input} from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {MatDialog} from "@angular/material/dialog";
import {
  FileDetailDialogComponent
} from "@shared-lib/modules/files/components/file-detail-dialog/file-detail-dialog.component";

@Component({
  selector: 'lib-app-run-param-list',
  imports: [
    TranslatePipe
  ],
  templateUrl: './app-run-param-list.component.html',
  styleUrl: './app-run-param-list.component.scss'
})
export class AppRunParamListComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  params = input.required<{ [key: string]: any }>();
  inputFiles = input<DataAnalysisFileDTO[]>();

  noParamsText = input<string>("NO_HYPERPARAMETERS")

  fileParams = computed(() => {
    const params = this.params();
    const result: { [key: string]: DataAnalysisFileDTO | undefined } = {}
    for (const key in params) {
      result[key] = this.getFile(key);
    }
    return result;
  })


  getParamsNames(): string[] {
    return Object.keys(this.params());
  }

  getFile(key: string): DataAnalysisFileDTO | undefined {
    if (this.inputFiles()) {
      return this.inputFiles()?.find(f => f.inputName === key);
    }
    return undefined;
  }

  openDetailDialog(file: DataAnalysisFileDTO): void {
    this.dialog.open(FileDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: file
    });
  }

}

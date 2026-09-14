import {ChangeDetectionStrategy, Component, effect, inject, input, output, signal} from '@angular/core';
import {
  DownloadService
} from "../../../../../../../global-app/src/app/modules/tool-development/service/download.service";
import {RunType} from "../../../../../../../global-app/src/app/modules/tool-development/dto/socket";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {TranslatePipe} from "@ngx-translate/core";
import {DataAnalysisFileDTO} from "@shared-lib/modules/app-execution/dto/model-workflow-file";
import {MatDialog} from "@angular/material/dialog";
import {
  FileDetailDialogComponent
} from "@shared-lib/modules/files/components/file-detail-dialog/file-detail-dialog.component";
import {
  FileDetailCardComponent
} from "@shared-lib/modules/files/components/file-detail-card/file-detail-card.component";
import {FileContentDTO, FileDTO} from "@shared-lib/modules/files/dto/file";
import {AppOutputVisualisations, VISUALISATIONS_KEY} from "@shared-lib/modules/app-execution/model/config";
import {
  AppRunOutputVisualizationComponent
} from "@shared-lib/modules/app-execution/components/app-run-output-visualization/app-run-output-visualization.component";
import {FileContentComponent} from "@shared-lib/modules/files/components/file-content/file-content.component";
import {ToolConfigDTO} from "@shared-lib/modules/app-execution/dto/config";

@Component({
  selector: 'lib-app-run-output',
  imports: [
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    FileDetailCardComponent,
    AppRunOutputVisualizationComponent,
    FileContentComponent,
  ],
  templateUrl: './app-run-output.component.html',
  styleUrl: './app-run-output.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppRunOutputComponent {
  private readonly downloadService: DownloadService = inject(DownloadService);
  private readonly dialog: MatDialog = inject(MatDialog);

  outputFiles = input<DataAnalysisFileDTO[]>();

  toolConfig = input<ToolConfigDTO[]>();
  outputData = input.required<{ [p: string]: string }>();
  appId = input.required<number>();
  runId = input.required<number>();
  runType = input.required<RunType>();
  showDownloadBtn = input<boolean>(true);
  showAnalyzeBtn = input<boolean>(false);

  visualisation = signal<AppOutputVisualisations[]>([]);

  analyzeClicked = output<DataAnalysisFileDTO>();

  initVizEffect = effect(() => {
    const data = this.outputData();
    if (data !== undefined && VISUALISATIONS_KEY in data) {
      try {
        let viz = data[VISUALISATIONS_KEY];
        viz = viz.replaceAll("True", "true");
        viz = viz.replaceAll("False", "false");
        viz = viz.replace(/'/g, '"');
        const visualizations = JSON.parse(viz);

        if (Array.isArray(visualizations)) {
          this.visualisation.set(visualizations);
        }
      } catch (e) {
        console.error('Failed to parse visualisations:', e);
      }
    }
  });

  downloadOutput(): void {
    this.downloadService.downloadZIP(this.appId(), this.runId(), this.runType()).subscribe();
  }

  getOutputNames(): string[] {
    let keys = Object.keys(this.outputData());
    if (keys.includes(VISUALISATIONS_KEY)) {
      //remove key, cuz we handel it special in signal visualisation
      keys = keys.filter(key => key !== VISUALISATIONS_KEY);
    }
    return keys;
  }

  openDetailDialog(file: FileDTO): void {
    this.dialog.open(FileDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
      data: file
    });
  }

  clickAnalyze(file: DataAnalysisFileDTO): void {
    this.analyzeClicked.emit(file);
  }

  getFileContent(key: string): FileContentDTO {
    if (key in this.outputData()) {
      const fileContent = this.outputData()[key];
      if (fileContent) {
        const configs = this.toolConfig();
        if (configs && configs.length > 0) {
          const config = configs.find(config => config.variableName === key);
          if(config) {
            return {
              content: fileContent,
              type: config.type
            }
          }
        }
        return {
          content: fileContent,
          type: 'TEXT'
        }
      }
    }
    return {
      content: "No content found",
      type: 'TEXT'
    }

  }
}

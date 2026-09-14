import {Component, input} from '@angular/core';
import {FileDTO} from "@shared-lib/modules/files/dto/file";
import {
  FileDetailCardComponent
} from "@shared-lib/modules/files/components/file-detail-card/file-detail-card.component";
import {
  AppRunOutputComponent
} from "@shared-lib/modules/app-execution/components/app-run-output/app-run-output.component";
import {RunType} from "../../../../../../../global-app/src/app/modules/tool-development/dto/socket";
import {ToolConfigDTO} from "@shared-lib/modules/app-execution/dto/config";

@Component({
  selector: 'lib-experiment-step-data',
  imports: [
    FileDetailCardComponent,
    AppRunOutputComponent
  ],
  templateUrl: './experiment-step-data.component.html',
  styleUrl: './experiment-step-data.component.scss'
})
export class ExperimentStepDataComponent {
  params = input<{ [p: string]: string }>();
  files = input<FileDTO[]>();
  configs = input<ToolConfigDTO[]>([]);

  appId = input.required<number>();
  runId = input.required<number>();

  runType: RunType = RunType.EXPERIMENT_RUN;

}

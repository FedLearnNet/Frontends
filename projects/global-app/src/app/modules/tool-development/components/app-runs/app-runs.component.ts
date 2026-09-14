import {Component, computed, input} from '@angular/core';
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";

import {AppRunTestComponent} from "./components/app-run-test/app-run-test.component";
import {
  AppRunFederatedTestComponent
} from "./components/app-run-federated-test/app-run-federated-test.component";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {ExperimentComponent} from "../experiment/experiment.component";
import {TranslatePipe} from "@ngx-translate/core";
import {LocalFiles} from "@shared-lib/modules/files/dto/file";
import {
  AppDetailMonitorComponent
} from "../app-detail-config/components/app-detail-monitor/app-detail-monitor.component";
import {Observable} from "rxjs";
import {PerformanceDTO} from "../../dto/performance";
import {MatIcon} from "@angular/material/icon";
import {StartAppWarningComponent} from "../start-app-warning/start-app-warning.component";
import {TOOL_TYPE_CONFIG_DEFAULT_OPTIONS, TOOL_TYPE_CONFIG_MAP} from "../../model/tool-config-type";


@Component({
  selector: 'app-app-runs',
  imports: [
    MatTab,
    MatTabGroup,
    AppRunTestComponent,
    AppRunFederatedTestComponent,
    ExperimentComponent,
    TranslatePipe,
    AppDetailMonitorComponent,
    MatIcon,
    MatTabLabel,
    StartAppWarningComponent
  ],
  templateUrl: './app-runs.component.html',
  styleUrl: './app-runs.component.scss'
})
export class AppRunsComponent {
  readonly app = input<AppDetailDto>();
  readonly appRunning = input<boolean>(false);
  readonly uiConnected = input<boolean>(false);

  readonly configOptions = computed(() => {
    if (this.app()?.type === undefined) return TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
    return TOOL_TYPE_CONFIG_MAP[this.app()!.type!] ?? TOOL_TYPE_CONFIG_DEFAULT_OPTIONS;
  });

  readonly supportsTraining = computed(() => {
    return this.configOptions().supportsTraining;
  });

  readonly localFiles = input<LocalFiles[]>([]);
  readonly datafiles = computed(() => this.localFiles().map(f => f.path));
  readonly performance$ = input<Observable<PerformanceDTO>>(new Observable<PerformanceDTO>());
}


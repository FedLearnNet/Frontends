import {Component, computed, inject, model, OnDestroy, OnInit, output, signal} from '@angular/core';
import {ConnectorAppBasedExtractorService} from "../../../../../../../services/connector-app-based-extractor.service";
import {
  AppBasedExtractorRequestDTO,
  ConnectorExtractorStreamDTO
} from "../../../../../../../dto/connector-app-based-extractor";
import {Subscription} from "rxjs";
import {AppBasedUploadSettings} from "../../../../../../../models/input-config";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatToolbar} from "@angular/material/toolbar";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {MatButton} from "@angular/material/button";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {environment} from "@global-app/env/environment";
import {MatTooltip} from "@angular/material/tooltip";
import {ConnectorDTO} from "../../../../../../../dto/connector";
import {ConnectorFileUploadInfoDTO} from "../../../../../../../dto/upload-info";

@Component({
  selector: 'app-app-based-extractor',
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatToolbar,
    BadgeComponent,
    MatButton,
    KvComponent,
    ErrorCardComponent,
    StatusBadgeComponent,
    MatTooltip
  ],
  templateUrl: './app-based-extractor.component.html',
  styleUrl: './app-based-extractor.component.scss',
})
export class AppBasedExtractorComponent implements OnInit, OnDestroy {
  readonly connectorAppBasedExtractorService = inject(ConnectorAppBasedExtractorService);

  readonly isProduction = environment.production;
  config = model.required<ConnectorDTO>();
  runStarted = output<boolean>();
  runFinished = output<ConnectorFileUploadInfoDTO[]>();

  cohortId = computed(() => this.config().cohortId ?? 1);

  appBasedConfig = computed(() => this.config().inputConfig as AppBasedUploadSettings);

  messages = signal<ConnectorExtractorStreamDTO[]>([]);
  showConfig = signal<boolean>(true);

  last = signal<ConnectorExtractorStreamDTO | null>(null);

  hyperParamKeys = computed(() => Object.keys(this.appBasedConfig()?.hyperParams ?? {}));
  inputDataKeys = computed(() => Object.keys(this.appBasedConfig()?.inputData ?? {}));

  private subscriptions: Subscription[] = [];

  hasStoredOutputs = computed(() =>
    Object.keys(this.appBasedConfig()?.outputParams ?? {}).length > 0);

  ngOnInit() {
    const config = this.config();
    if (!config.id || !config.inputConfig || !(config.inputConfig as any).appVersionId) {
      return;
    }
    if (this.hasStoredOutputs()) {
      return;
    }
    this.startAppBasedExtractor();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  startAppBasedExtractor(): void {

    const data: AppBasedExtractorRequestDTO = {
      appImage: this.appBasedConfig().appImage,
      appVersionId: this.appBasedConfig().appVersionId,
      cohortId: this.cohortId(),
      hyperParams: this.appBasedConfig().hyperParams,
      inputData: this.appBasedConfig().inputData,
    };
    /*
   const data: AppBasedExtractorRequestDTO = {
     appImage: "gitlab.cosy.bio:5050/cosybio/federated-learning/federated_db/apps/import-diabetes-130-us-hospitals-for-years-1999-2008/model:latest",
     appVersionId: 1,
     cohortId: "1",
     hyperParams: {},
     inputData: {},
   };*/
    this.runStarted.emit(true);
    this.cleanup();
    this.subscriptions.push(this.connectorAppBasedExtractorService.runApp(data).subscribe(msg => {
      this.last.set(msg);
      this.messages.update(m => {
        m.push(msg);
        return m;
      })
      if (msg.uploadInfo) {
        this.runFinished.emit(msg.uploadInfo);
      }
    }));
  }

  getFileName(path?: string) {
    if (!path || !path.includes("/")) {
      return path;
    }
    const paths = path.split("/");
    return paths[paths.length - 1];
  }

  cleanup() {
    this.last.set(null);
    this.messages.set([]);
  }
}

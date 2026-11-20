import {Component, computed, inject, model, OnDestroy, OnInit, output, signal, ChangeDetectionStrategy} from '@angular/core';
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
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
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
  // One instance per extractor view, so a failed or running stream never shows up on another connector.
  providers: [ConnectorAppBasedExtractorService],
  templateUrl: './app-based-extractor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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

  status = computed<StatusBadeType>(() => {
    const service = this.connectorAppBasedExtractorService;
    if (service.running()) return 'RUNNING';
    if (service.error()) return 'FAILED';
    if (this.last()?.uploadInfo?.length || this.hasStoredOutputs()) return 'SUCCESS';
    return 'PENDING';
  });

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
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [this.connectorAppBasedExtractorService.runApp(data).subscribe({
      next: msg => {
        this.last.set(msg);
        this.messages.update(m => [...m, msg]);
        if (msg.uploadInfo?.length) {
          if (msg.outputParams && Object.keys(msg.outputParams).length > 0) {
            this.config.update(c => ({
              ...c,
              inputConfig: {
                ...(c.inputConfig as AppBasedUploadSettings),
                outputParams: {...msg.outputParams},
              } as AppBasedUploadSettings,
            }));
          }
          this.runFinished.emit(msg.uploadInfo);
        }
      },
      error: () => undefined
    })];
  }

  formatInputDataValue(value: unknown): string {
    if (value == null || value === '') {
      return '—';
    }
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
      return `File #${value}`;
    }
    if (value instanceof File) {
      return value.name;
    }
    const text = String(value);
    if (!text.includes('/')) {
      return text;
    }
    return text.split('/').pop() || text;
  }

  lastMessageText(msg: ConnectorExtractorStreamDTO): string {
    if (msg.lastLog?.trim()) {
      return msg.lastLog;
    }
    const logs = msg.logs ?? [];
    for (let i = logs.length - 1; i >= 0; i--) {
      const text = logs[i]?.message?.trim();
      if (text) {
        return text;
      }
    }
    if (msg.uploadInfo?.length) {
      return `Finished with ${msg.uploadInfo.length} preview table(s)`;
    }
    return msg.status ?? '—';
  }

  cleanup() {
    this.last.set(null);
    this.messages.set([]);
  }
}

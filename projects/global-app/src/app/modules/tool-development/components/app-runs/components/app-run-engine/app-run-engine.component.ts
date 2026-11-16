import {ChangeDetectionStrategy, Component, computed, inject, input} from '@angular/core';
import {RunExecutionHelpComponent} from '@shared-lib/modules/app-execution/components/run-execution-help/run-execution-help.component';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDialog} from "@angular/material/dialog";
import {Store} from "@ngrx/store";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {errorOf, isFinalStatus} from "@shared-lib/modules/app-execution/dto/execution-run";
import {runStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {PipelineStatus} from "../../../../../pipeline/dto/pipeline";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {EmptyStateComponent} from "@shared-lib/modules/app-execution/components/empty-state/empty-state.component";
import {engineAttemptOf, TestEngineMode, testEngineModeLabels} from "../../../../dto/test-engine";
import {RunStatusTypes, TestRunDTO} from "../../../../dto/test-run";
import * as TestEngineActions from "../../../../store/test-engine.actions";
import {
  selectConnectingTestEngine,
  selectTestEngines,
  selectTestEngineStarting
} from "../../../../store/test-engine.selectors";
import {
  AppRunEngineSingleDialogComponent
} from "../app-run-engine-single-dialog/app-run-engine-single-dialog.component";
import {
  AppRunEngineLogsDialogComponent,
  AppRunEngineLogsDialogData
} from "../app-run-engine-logs-dialog/app-run-engine-logs-dialog.component";
import {AppRunFederatedTestStartComponent} from "../app-run-federated-test-start/app-run-federated-test-start.component";

const MODE_ICONS: Record<TestEngineMode, string> = {
  [TestEngineMode.ENGINE]: 'deployed_code',
  [TestEngineMode.SELF_TEST]: 'science',
  [TestEngineMode.SINGLE_RUN]: 'upload_file',
  [TestEngineMode.FEDERATED_RUN]: 'hub',
};

// Runs of the built image on the platform: the self-test, single runs and the engines started from the header
@Component({
  selector: 'app-app-run-engine',
  imports: [RunExecutionHelpComponent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTableModule,
    MatTooltip,
    BadgeComponent,
    StatusBadgeComponent,
    TimeBadgeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './app-run-engine.component.html',
  styleUrl: './app-run-engine.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRunEngineComponent {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  readonly app = input.required<AppDetailDto>();
  // The app's engine is connected, a local one or a container
  readonly appRunning = input<boolean>(false);

  // The header's engine control loads them for the app page
  readonly engines = this.store.selectSignal(selectTestEngines);
  readonly starting = this.store.selectSignal(selectTestEngineStarting);

  readonly connectingEngine = this.store.selectSignal(selectConnectingTestEngine);

  readonly hasImage = computed(() => !!this.app().hasImage);
  readonly selfTesting = computed(() => this.engines().some(e => e.engineMode === TestEngineMode.SELF_TEST && !isFinalStatus(e.status)));
  readonly displayedColumns = ['mode', 'version', 'status', 'createdAt', 'duration', 'result', 'actions'];

  // Why an action is not possible; empty when it is
  readonly selfTestHint = computed(() => {
    if (!this.hasImage()) return 'This version has no image yet';
    if (this.selfTesting()) return 'A self-test is running';
    if (this.starting()) return 'Starting…';
    return '';
  });
  readonly singleRunHint = computed(() => {
    if (!this.hasImage()) return 'This version has no image yet';
    if (this.starting()) return 'Starting…';
    return '';
  });
  readonly engineHint = computed(() => {
    if (!this.hasImage()) return 'This version has no image yet';
    if (this.appRunning()) return 'A local engine is connected; stop it to use the built version';
    if (this.starting()) return 'Starting…';
    return '';
  });

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
  protected readonly PipelineStatus = PipelineStatus;

  protected modeLabelOf(engine: TestRunDTO): string {
    return engine.engineMode ? testEngineModeLabels[engine.engineMode] : '';
  }

  protected modeIconOf(engine: TestRunDTO): string {
    return engine.engineMode ? MODE_ICONS[engine.engineMode] : 'deployed_code';
  }


  protected isActive(engine: TestRunDTO): boolean {
    return !isFinalStatus(engine.status);
  }

  protected resultOf(engine: TestRunDTO): string {
    const exitCode = engineAttemptOf(engine)?.exitCode;
    const error = errorOf(engine);
    if (error) return error;
    if (engine.engineMode === TestEngineMode.FEDERATED_RUN) return engine.steps.flatMap(step => step.attempts ?? []).length + ' containers';
    if (exitCode !== null && exitCode !== undefined) return 'Exit code ' + exitCode;
    const connected = engineAttemptOf(engine)?.status === RunStatusTypes.RUNNING;
    return connected && engine.engineMode !== TestEngineMode.SELF_TEST ? 'Connected' : '';
  }

  runSelfTest(): void {
    this.start(TestEngineMode.SELF_TEST);
  }

  runOnceWithData(): void {
    this.dialog.open<unknown>(this.app().supportsFederatedLearning ? AppRunFederatedTestStartComponent : AppRunEngineSingleDialogComponent, {
      width: '720px',
      maxWidth: '100vw',
      autoFocus: false,
      data: {app: this.app(), builtImage: true, datafiles: []},
    });
  }

  openLogs(engine: TestRunDTO): void {
    this.dialog.open(AppRunEngineLogsDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '100vw',
      autoFocus: false,
      data: {appId: this.app().id, engine} as AppRunEngineLogsDialogData,
    });
  }

  startEngine(): void {
    this.start(TestEngineMode.ENGINE);
  }

  stop(engine: TestRunDTO): void {
    this.store.dispatch(TestEngineActions.stopTestEngine({appId: this.app().id, id: engine.id}));
  }

  private start(mode: TestEngineMode): void {
    this.store.dispatch(TestEngineActions.startTestEngine({appId: this.app().id, create: {mode}}));
  }
}

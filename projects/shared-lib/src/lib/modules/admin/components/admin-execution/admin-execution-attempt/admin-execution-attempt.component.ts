import {ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {InfoGridComponent} from '@shared-lib/components/info-grid/info-grid.component';
import {InfoItemComponent} from '@shared-lib/components/info-item/info-item.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {ValueCardComponent} from '@shared-lib/components/value-card/value-card.component';
import {StatusTitleComponent} from '@shared-lib/components/status-title/status-title.component';
import {
  FederatedClientTypeBadgeComponent
} from '@shared-lib/components/federated-client-type-badge/federated-client-type-badge.component';
import {JsonEditorComponent} from '@shared-lib/components/json-editor/json-editor.component';
import {RunPerformanceComponent} from '@shared-lib/components/run-performance/run-performance.component';
import {
  ExperimentWorkflowNodeDetailComponent
} from '@shared-lib/modules/experiments/components/experiment-workflow-node-detail/experiment-workflow-node-detail.component';
import {ExperimentData} from '@shared-lib/modules/experiments/models/experiment-data';
import {runStatusToBadgeStatus} from '@shared-lib/utils/badge-status.helper';
import {ExecutionAdminService} from '../../../services/execution-admin.service';
import {AdminExecutionAttemptDTO} from '../../../dto/execution-admin';

@Component({
  selector: 'lib-admin-execution-attempt',
  imports: [
    MatButtonModule,
    MatIconModule,
    HeaderComponent,
    PageWrapperComponent,
    TimeBadgeComponent,
    InfoGridComponent,
    InfoItemComponent,
    InfoCardComponent,
    BadgeComponent,
    ValueCardComponent,
    StatusTitleComponent,
    FederatedClientTypeBadgeComponent,
    JsonEditorComponent,
    RunPerformanceComponent,
    ExperimentWorkflowNodeDetailComponent,
  ],
  templateUrl: './admin-execution-attempt.component.html',
  styleUrl: '../admin-execution.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminExecutionAttemptComponent {
  private readonly service = inject(ExecutionAdminService);

  readonly runId = input.required({transform: numberAttribute});
  readonly stepId = input.required({transform: numberAttribute});
  readonly attemptId = input.required({transform: numberAttribute});

  readonly attempt = rxResource({
    params: () => ({runId: this.runId(), stepId: this.stepId(), attemptId: this.attemptId()}),
    stream: ({params}) => this.service.getAttempt(params.runId, params.stepId, params.attemptId),
  });

  readonly title = computed(() => {
    const attempt = this.attempt.value();
    return attempt ? `Attempt #${attempt.id} · trial ${attempt.trialIndex} (step #${attempt.stepId}, run #${attempt.runId})` : 'Attempt';
  });

  readonly experimentData = computed<ExperimentData | undefined>(() => {
    const attempt = this.attempt.value();
    return attempt ? this.experimentDataOf(attempt) : undefined;
  });

  readonly raw = computed(() => {
    const attempt = this.attempt.value();
    if (!attempt) {
      return undefined;
    }
    const {logs, metrics, inputFiles, outputFiles, outputData, ...rest} = attempt;
    return rest;
  });

  private experimentDataOf(attempt: AdminExecutionAttemptDTO): ExperimentData {
    return {
      logs: attempt.logs ?? [],
      metric: attempt.metrics ?? [],
      experimentId: attempt.runId,
      stepId: attempt.id,
      status: attempt.status,
      hyperParams: Object.fromEntries(Object.entries(attempt.params ?? {})
        .map(([key, value]) => [key, typeof value === 'string' ? value : JSON.stringify(value)])),
      inputData: {
        data: {},
        files: (attempt.inputFiles ?? []).map(file => file.file),
      },
      outputData: {
        data: (attempt.outputData ?? {}) as { [key: string]: string },
        files: (attempt.outputFiles ?? []).map(file => file.file),
      },
    };
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}

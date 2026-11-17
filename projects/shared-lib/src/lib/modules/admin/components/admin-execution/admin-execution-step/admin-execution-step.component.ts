import {ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {InfoGridComponent} from '@shared-lib/components/info-grid/info-grid.component';
import {InfoItemComponent} from '@shared-lib/components/info-item/info-item.component';
import {InfoCardComponent} from '@shared-lib/components/info-card/info-card.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {StatusTitleComponent} from '@shared-lib/components/status-title/status-title.component';
import {DockerImageTagComponent} from '@shared-lib/components/docker-image-tag/docker-image-tag.component';
import {JsonEditorComponent} from '@shared-lib/components/json-editor/json-editor.component';
import {runStatusToBadgeStatus} from '@shared-lib/utils/badge-status.helper';
import {displayedAttempt} from '@shared-lib/modules/app-execution/dto/execution-run';
import {ExecutionAdminService} from '../../../services/execution-admin.service';
import {AdminExecutionAttemptDTO} from '../../../dto/execution-admin';

@Component({
  selector: 'lib-admin-execution-step',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    HeaderComponent,
    PageWrapperComponent,
    StatusBadgeComponent,
    TimeBadgeComponent,
    InfoGridComponent,
    InfoItemComponent,
    InfoCardComponent,
    BadgeComponent,
    StatusTitleComponent,
    DockerImageTagComponent,
    JsonEditorComponent,
  ],
  templateUrl: './admin-execution-step.component.html',
  styleUrl: '../admin-execution.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminExecutionStepComponent {
  private readonly service = inject(ExecutionAdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly runId = input.required({transform: numberAttribute});
  readonly stepId = input.required({transform: numberAttribute});

  readonly attemptColumns = ['trial', 'id', 'status', 'params', 'score', 'container', 'exitCode', 'progress',
    'started', 'duration', 'failure'];

  readonly step = rxResource({
    params: () => ({runId: this.runId(), stepId: this.stepId()}),
    stream: ({params}) => this.service.getStep(params.runId, params.stepId),
  });

  readonly attempts = computed(() => [...(this.step.value()?.attempts ?? [])]);

  readonly shownAttemptId = computed(() => {
    const step = this.step.value();
    return step ? displayedAttempt(step)?.id : undefined;
  });

  readonly title = computed(() => {
    const step = this.step.value();
    const name = step?.name || step?.appName;
    return step ? `Step #${step.id}${name ? ' · ' + name : ''} (run #${step.runId})` : 'Step';
  });

  open(attempt: AdminExecutionAttemptDTO): void {
    this.router.navigate(['attempts', attempt.id], {relativeTo: this.route});
  }

  paramsOf(attempt: AdminExecutionAttemptDTO): string {
    return attempt.params ? JSON.stringify(attempt.params) : '—';
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}

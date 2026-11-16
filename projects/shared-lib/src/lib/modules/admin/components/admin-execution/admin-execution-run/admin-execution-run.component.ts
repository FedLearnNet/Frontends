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
import {
  FederatedClientTypeBadgeComponent
} from '@shared-lib/components/federated-client-type-badge/federated-client-type-badge.component';
import {runStatusToBadgeStatus} from '@shared-lib/utils/badge-status.helper';
import {displayedAttempt} from '@shared-lib/modules/app-execution/dto/execution-run';
import {ExecutionAdminService} from '../../../services/execution-admin.service';
import {AdminExecutionStepDTO} from '../../../dto/execution-admin';

@Component({
  selector: 'lib-admin-execution-run',
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
    FederatedClientTypeBadgeComponent,
  ],
  templateUrl: './admin-execution-run.component.html',
  styleUrl: '../admin-execution.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminExecutionRunComponent {
  private readonly service = inject(ExecutionAdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly runId = input.required({transform: numberAttribute});

  readonly stepColumns = ['id', 'name', 'node', 'status', 'attempts', 'selected', 'started', 'duration', 'failure'];

  readonly run = rxResource({
    params: () => this.runId(),
    stream: ({params}) => this.service.getRun(params),
  });

  readonly title = computed(() => {
    const run = this.run.value();
    return run ? `Run #${run.id}${run.name ? ' · ' + run.name : ''}` : 'Run';
  });

  open(step: AdminExecutionStepDTO): void {
    this.router.navigate(['steps', step.id], {relativeTo: this.route});
  }

  stepName(step: AdminExecutionStepDTO): string {
    return step.name || step.appName || '—';
  }

  selectedTrial(step: AdminExecutionStepDTO): string {
    const attempt = displayedAttempt(step);
    return attempt ? `#${attempt.trialIndex} (id ${attempt.id})` : '—';
  }

  protected readonly runStatusToBadgeStatus = runStatusToBadgeStatus;
}

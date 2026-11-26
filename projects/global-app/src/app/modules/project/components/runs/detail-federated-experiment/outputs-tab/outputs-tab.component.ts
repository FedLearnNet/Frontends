import {ChangeDetectionStrategy, Component, inject, input, OnInit, signal} from '@angular/core';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {FileDetailCardComponent} from '@shared-lib/modules/files/components/file-detail-card/file-detail-card.component';
import {ExecutionFileDTO} from '@shared-lib/modules/app-execution/dto/execution-run';
import {RunMetricsRequestDto} from '@global-app/project/dto/run-metrics-request';
import {RunMetricsRequestService} from '@global-app/project/services/run-metrics-request.service';

/**
 * TRE: the outputs the clinic released on an outputs request.
 */
@Component({
  selector: 'app-outputs-tab',
  imports: [EmptyStateComponent, PageWrapperComponent, FileDetailCardComponent],
  templateUrl: './outputs-tab.component.html',
  styleUrl: './outputs-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutputsTabComponent implements OnInit {
  private readonly service = inject(RunMetricsRequestService);

  projectId = input.required<number>();
  experimentId = input.required<number>();
  outputs = input.required<ExecutionFileDTO[]>();

  readonly request = signal<RunMetricsRequestDto | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.service.getRequest(this.projectId(), this.experimentId(), 'OUTPUTS').subscribe({
      next: request => {
        this.request.set(request);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  requestOutputs(): void {
    this.loading.set(true);
    this.service.createRequest(this.projectId(), this.experimentId(), 'OUTPUTS').subscribe({
      next: request => {
        this.request.set(request);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}

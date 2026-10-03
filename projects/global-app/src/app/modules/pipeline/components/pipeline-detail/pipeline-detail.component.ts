import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal,
  signal
} from '@angular/core';
import {Store} from "@ngrx/store";
import {selectById, selectStreaming} from "../../service/pipeline.selectors";
import {PipelineDTO, PipelineStatus} from "../../dto/pipeline";
import {getPipeline, startPipelineStream, stopPipeline, stopPipelineStream} from "../../service/pipeline.actions";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import {PipelineStepsComponent} from "@shared-lib/modules/pipeline/components/pipeline-steps/pipeline-steps.component";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-pipeline-detail',
  imports: [
    StatusBadgeComponent,
    SseRefreshBtnComponent,
    PipelineStepsComponent,
    MatIcon,
    MatIconButton,
    MatTooltip
  ],
  templateUrl: './pipeline-detail.component.html',
  styleUrl: './pipeline-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineDetailComponent implements OnInit, OnDestroy {
  private readonly store: Store = inject(Store);
  id = input.required<number>();

  pipelineFromCache: Signal<PipelineDTO | undefined> = signal<PipelineDTO | undefined>(undefined);
  stopClicked = signal<boolean>(false);
  readonly streaming = this.store.selectSignal(selectStreaming);

  readonly pipeline = computed(() => this.pipelineFromCache());
  readonly pipelineId = computed(() => this.pipeline()?.id ?? this.id());
  readonly pipelineStatus = computed(() => this.pipeline()?.pipelineStatus);

  ngOnInit() {
    this.pipelineFromCache = this.store.selectSignal(selectById(this.id()));
    this.refreshPipeline();
  }

  ngOnDestroy() {
    this.store.dispatch(stopPipelineStream());
  }

  protected readonly pipelineStatusToBadgeStatus = pipelineStatusToBadgeStatus;

  protected refreshPipeline() {
    const id = this.id();
    // Dispatch actions separately to avoid sequential dispatch warning
    this.store.dispatch(getPipeline({id}));
    setTimeout(() => this.store.dispatch(startPipelineStream({id})), 0);
  }

  protected stopExecution() {
    if (!this.pipeline()) {
      return;
    }
    if (this.stopClicked()) {
      return;
    }
    this.store.dispatch(stopPipeline({id: this.pipeline()!.id}))
  }

  protected readonly PipelineStatus = PipelineStatus;
}

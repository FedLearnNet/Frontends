import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import {Store} from "@ngrx/store";
import {selectById, selectStreaming} from "../../service/pipeline.selectors";
import {PipelineDTO, PipelineStatus, PipelineStepDTO, StepName} from "../../dto/pipeline";
import {getPipeline, startPipelineStream, stopPipeline, stopPipelineStream} from "../../service/pipeline.actions";
import {MatStepperModule} from "@angular/material/stepper";
import {MatTableModule} from "@angular/material/table";
import {PipelineStepComponent} from "../pipeline-step/pipeline-step.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {
  PipelinePublishInfoDetailComponent
} from "../pipeline-publish-info-detail/pipeline-publish-info-detail.component";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-pipeline-detail',
  imports: [
    MatStepperModule,
    MatTableModule,
    PipelineStepComponent,
    StatusBadgeComponent,
    SseRefreshBtnComponent,
    TimeBadgeComponent,
    PipelinePublishInfoDetailComponent,
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
  readonly publishInfo = computed(() => this.pipeline()?.publishInfo);
  readonly pipelineSteps = computed(() => {
    const steps = this.pipeline()?.pipelineSteps ?? [];
    const order: StepName[] = [
      StepName.FETCH_CONFIG,
      StepName.CLONE_REPO,
      StepName.FETCH_FILES,
      StepName.BUILD_IMAGE,
      StepName.SCAN_IMAGE,
      StepName.MALWARE_CHECK,
      StepName.RUN_PYTEST,
      StepName.PUSH_IMAGE,
      StepName.COLLECT_SUMMARY,
    ];
    return steps
      .filter(s => order.includes(s.name as StepName))
      .slice()
      .sort((a, b) => order.indexOf(a.name as StepName) - order.indexOf(b.name as StepName));
  });

  readonly selectedStep: WritableSignal<PipelineStepDTO | undefined> = signal<PipelineStepDTO | undefined>(undefined);

  displayedColumns: string[] = ['status', 'name', 'started', 'duration'];

  ngOnInit() {
    this.pipelineFromCache = this.store.selectSignal(selectById(this.id()));
    this.refreshPipeline();
  }

  ngOnDestroy() {
    this.store.dispatch(stopPipelineStream());
  }

  getName(step: PipelineStepDTO) {
    return step.name
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  selectStep(step: PipelineStepDTO) {
    this.selectedStep.set(step);
  }

  unselectStep() {
    this.selectedStep.set(undefined);
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

  protected trackByStep = (_: number, step: PipelineStepDTO) => step.id ?? step.name;

  protected readonly PipelineStatus = PipelineStatus;
}

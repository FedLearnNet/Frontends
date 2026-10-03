import {ChangeDetectionStrategy, Component, computed, input, signal} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {BasePipelineDTO, PipelineStepDTO, STEP_ORDER, stepLabel} from "../../dto/pipeline";
import {PipelineStepComponent} from "../pipeline-step/pipeline-step.component";
import {
  PipelinePublishInfoDetailComponent
} from "../pipeline-publish-info-detail/pipeline-publish-info-detail.component";

@Component({
  selector: 'lib-pipeline-steps',
  imports: [MatTableModule, StatusBadgeComponent, TimeBadgeComponent, PipelineStepComponent, PipelinePublishInfoDetailComponent],
  templateUrl: './pipeline-steps.component.html',
  styleUrl: './pipeline-steps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineStepsComponent {
  readonly pipeline = input<BasePipelineDTO | null | undefined>();

  readonly steps = computed(() => (this.pipeline()?.pipelineSteps ?? [])
    .filter(step => STEP_ORDER.includes(step.name))
    .sort((a, b) => STEP_ORDER.indexOf(a.name) - STEP_ORDER.indexOf(b.name)));
  readonly selectedName = signal<string | null>(null);
  readonly selectedStep = computed(() => this.steps().find(step => step.name === this.selectedName()));

  readonly displayedColumns = ['status', 'name', 'started', 'duration'];
  protected readonly stepLabel = stepLabel;
  protected readonly pipelineStatusToBadgeStatus = pipelineStatusToBadgeStatus;
  protected readonly trackByStep = (_: number, step: PipelineStepDTO) => step.id ?? step.name;
}

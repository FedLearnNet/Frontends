import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {PipelineStepDTO} from "../../dto/pipeline";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {RawLogViewerComponent} from "@shared-lib/components/raw-log-viewer/raw-log-viewer.component";

@Component({
  selector: 'app-pipeline-step',
  imports: [
    MatIcon,
    MatIconButton,
    MatToolbar,
    TimeBadgeComponent,
    StatusBadgeComponent,
    RawLogViewerComponent
  ],
  templateUrl: './pipeline-step.component.html',
  styleUrl: './pipeline-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineStepComponent {
  readonly step = input.required<PipelineStepDTO>();
  readonly backClicked = output();

  logsLines = computed(() => {
    const logs = this.step().logs;
    if (logs && logs.length > 0) {
      return logs.split("\n")
        .filter(line => line.trim().length > 0)
    }
    return [];
  });

  name = computed(() => {
    const name = this.step().name;
    return name
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });

  goBack() {
    this.backClicked.emit();
  }

  protected readonly pipelineStatusToBadgeStatus = pipelineStatusToBadgeStatus;
}

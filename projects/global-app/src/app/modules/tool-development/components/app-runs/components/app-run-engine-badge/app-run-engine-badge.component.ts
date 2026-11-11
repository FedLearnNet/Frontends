import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatTooltip} from "@angular/material/tooltip";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {TestRunDTO} from "../../../../dto/test-run";
import {testEngineModeLabels} from "../../../../dto/test-engine";

@Component({
  selector: 'app-app-run-engine-badge',
  imports: [
    BadgeComponent,
    MatTooltip,
  ],
  templateUrl: './app-run-engine-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppRunEngineBadgeComponent {
  readonly run = input.required<TestRunDTO>();

  readonly container = computed(() => !!this.run().testEngineId);
  readonly tooltip = computed(() => {
    const mode = this.run().testEngineMode;
    return mode ? 'Built image, ' + testEngineModeLabels[mode].toLowerCase() : 'Local engine';
  });
}

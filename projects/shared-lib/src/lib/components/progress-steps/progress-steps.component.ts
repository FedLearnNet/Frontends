import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";

/**
 * A compact horizontal step indicator: done steps are checked, the current one is highlighted
 * while running or marked as failed.
 */
@Component({
  selector: 'lib-progress-steps',
  imports: [MatIcon],
  templateUrl: './progress-steps.component.html',
  styleUrl: './progress-steps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressStepsComponent {
  steps = input.required<string[]>();
  /** Index of the current step; steps before it count as done, steps.length means all done. */
  active = input<number>(0);
  running = input<boolean>(false);
  failed = input<boolean>(false);
  ariaLabel = input<string>('Progress');
}

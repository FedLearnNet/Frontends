import {Component, computed, input} from '@angular/core';

@Component({
  selector: 'app-experiment-run-circle',
  imports: [],
  templateUrl: './experiment-run-circle.component.html',
  styleUrl: './experiment-run-circle.component.scss'
})
export class ExperimentRunCircleComponent {
  readonly color = input<string | undefined>();
  readonly bgColor = computed(() => {
    const c = this.color();
    return c && c.trim().length > 0 ? c : '#4F46E5'; // default color
  });
}

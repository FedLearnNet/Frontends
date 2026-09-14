import {Component, computed, input} from '@angular/core';
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";

@Component({
  selector: 'lib-run-hyper-params',
  imports: [
    BadgeComponent,
    HintCardComponent
  ],
  templateUrl: './run-hyper-params.component.html',
  styleUrl: './run-hyper-params.component.scss'
})
export class RunHyperParamsComponent {

  hyperParams = input.required<{ [key: string]: string }>();

  entries = computed(() => {
    const hp = this.hyperParams() ?? {};
    return Object.keys(hp)
      .sort((a, b) => a.localeCompare(b))
      .map(k => ({key: k, value: hp[k] ?? ''}));
  });
}

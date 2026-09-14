import {Component, computed, input} from '@angular/core';
import {StatusBadeType, StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";

@Component({
  selector: 'lib-status-title',
  imports: [
    StatusBadgeComponent
  ],
  templateUrl: './status-title.component.html',
  styleUrl: './status-title.component.scss'
})
export class StatusTitleComponent {
  type = input<StatusBadeType>();

  typeClassName = computed(() => this.type() ? this.type()!.toLowerCase() : 'init');

  headClassName = computed(() =>
    `title ${this.typeClassName()}`
  );
}

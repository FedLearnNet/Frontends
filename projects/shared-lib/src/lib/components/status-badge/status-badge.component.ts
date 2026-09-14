import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";

export type StatusBadeType = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | 'WARNING' | 'INIT' | 'STOPPED';
export type StatusBadgeSize = 'X-SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE';

@Component({
  selector: 'lib-status-badge',
  imports: [
    MatIcon,
  ],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  text = input<string>();
  type = input<StatusBadeType>();
  size = input<StatusBadgeSize>('MEDIUM');
  animate = input<boolean>(true);
  noText = input<boolean>(false);
  width = input<number | null>(null);
  border = input<boolean>(false);

  typeClassName = computed(() => this.type() ? this.type()!.toLowerCase() : 'init');

  className = computed(() =>
    `status-badge ${this.typeClassName()} ${this.size().toLowerCase()} ${this.animate() ? 'animated' : ''} ${this.border() ? 'border' : ''}`
  );
  widthPx = computed(() => (this.width() ? `${this.width()}px` : null));

  textFormatted = computed(() => {
    const t = this.text();
    if (!t) return '';
    return t
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));
  });

  formattedType = computed(() => {
    const t = this.type();
    if (!t) return '';
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  });

  iconName = computed(() => {
    if (!this.type()) return undefined;
    switch (this.type()) {
      case 'SUCCESS':
        return 'check_circle';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'sync';
      case 'PENDING':
        return 'schedule';
      case 'WARNING':
        return 'warning';
      case 'INIT':
        return 'not_started';
      case 'STOPPED':
        return 'stop_circle';
    }
    return undefined;
  });
}

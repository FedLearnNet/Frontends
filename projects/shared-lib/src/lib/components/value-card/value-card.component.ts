import {Component, computed, input} from '@angular/core';
import {BadgeColor} from '../badge/badge.component';

type FormatType = 'number' | 'delta';
type SizeType = 'SMALL' | 'MEDIUM' | 'LARGE';

@Component({
  selector: 'lib-value-card',
  imports: [],
  templateUrl: './value-card.component.html',
  styleUrl: './value-card.component.scss',
})
export class ValueCardComponent {
  label = input.required<string>();
  value = input<any>();

  format = input<FormatType>();
  formatNumberDigest = input<number>(4);
  size = input<SizeType>('MEDIUM');
  /** Optional accent color, sharing the same palette as lib-badge. */
  color = input<BadgeColor>();

  formatedValue = computed(() => {
    if (this.format()) {
      switch (this.format()) {
        case 'number':
          return this._formatNumber(this.value());
        case 'delta':
          return this._formatDelta(this.value());
        default:
          return this.value();
      }
    }
    return this.value();
  });

  /** Whether an explicit value was provided (0 is a valid value, only null/undefined is empty). */
  hasValue = computed(() => this.value() !== null && this.value() !== undefined);

  classList = computed(() => {
    const color = this.color();
    return ['card', this.size().toLowerCase(), color ? color.toLowerCase() : '']
      .filter(Boolean)
      .join(' ');
  });

  _formatNumber(v: number | null | undefined): string {
    return v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(4);
  }

  _formatDelta(v: number | null | undefined): string {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    return (v >= 0 ? '+' : '') + v.toFixed(4);
  }


}

import {Component, computed, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

export type InfoCardType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR' | 'PRIMARY';
export type InfoCardVariant = 'NOTICE' | 'BANNER' | 'CARD';
export type InfoCardSize = 'SMALL' | 'MEDIUM' | 'LARGE';

const DEFAULT_ICONS: Record<InfoCardType, string> = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'check_circle',
  ERROR: 'error',
  PRIMARY: 'lightbulb',
};

@Component({
  selector: 'lib-info-card',
  imports: [MatIcon],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.scss',
})
export class InfoCardComponent {
  title = input<string>();
  subtitle = input<string>();
  type = input<InfoCardType>('INFO');
  variant = input<InfoCardVariant>('BANNER');
  size = input<InfoCardSize>('MEDIUM');
  border = input<boolean>(false);
  icon = input<string>();

  resolvedIcon = computed(() => this.icon() ?? DEFAULT_ICONS[this.type()]);

  className = computed(() =>
    ['info-card',
      this.variant().toLowerCase(),
      this.type().toLowerCase(),
      this.size().toLowerCase(),
      !this.title() ? 'no-title' : '',
      this.border() ? 'border' : '',
    ].filter(Boolean).join(' ')
  );
}

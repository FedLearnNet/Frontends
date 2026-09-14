import {Component, computed, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";

export type BadgeSize = 'X-SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE';
export type BadgeAnimation = 'PULSE' | 'FADE';
export type BadgeColor = 'GREEN' | 'GRAY' | 'RED' | 'ORANGE' | 'BLUE' | 'WHITE';


@Component({
  selector: 'lib-badge',
  imports: [
    MatIcon
  ],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  text = input.required<string>();
  iconName = input<string>();
  color = input<BadgeColor>('GREEN');
  size = input<BadgeSize>('SMALL');
  animate = input<BadgeAnimation>();
  border = input<boolean>(false);
  pulseCircle = input<boolean>(false);
  wrap = input<boolean>(false);

  uppercase = input<boolean>(false);

  className = computed(() =>
    `badge ${this.size().toLowerCase()}
    ${this.animate()?.toLowerCase()}
    ${this.color()?.toLowerCase()}
    ${this.border() ? 'border' : ''}
    ${this.wrap() ? 'wrap' : ''}`
  );

  formattedText = computed(() => {
    const text = this.text() ?? '';
    return this.uppercase()
      ? text
      : text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  });
}

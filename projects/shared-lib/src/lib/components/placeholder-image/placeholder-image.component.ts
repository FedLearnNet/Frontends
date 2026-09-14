import {Component, computed, input} from '@angular/core';
import {NgStyle} from "@angular/common";

@Component({
  selector: 'lib-placeholder-image',
  imports: [
    NgStyle
  ],
  templateUrl: './placeholder-image.component.html',
  styleUrl: './placeholder-image.component.scss'
})
export class PlaceholderImageComponent {

  src = input<string>();
  name = input.required<string>();


  readonly bgColor = computed(() => this.pickColor(this.name()));
  readonly fontSize = computed(() => this.computeFontSize(this.name()));

  private readonly palette = [
    '#FF6B6B', // coral
    '#6BCB77', // mint
    '#4D96FF', // sky blue
    '#FFD93D', // sunflower
    '#845EC2', // lavender
    '#FF9671', // peach
    '#00C9A7', // teal
    '#1b981b', // lemon
  ];

  private pickColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // force to 32bit int
    }
    const idx = Math.abs(hash) % this.palette.length;
    return this.palette[idx];
  }


  private computeFontSize(name: string): string {
    const len = name.trim().length;
    if (len <= 10) {
      return '30px';
    }
    // e.g. for 20 chars: 100/20 = 5px → clamp to minimum 24px
    const size = Math.max(30, Math.min(24, 100 / len));
    return `${size}px`;
  }
}

import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

interface HeroSite {
  label: string;
  x: number;
  tone: 'violet' | 'green' | 'brown';
  /** Offset so the sites do not send their updates in lockstep. */
  delay: number;
}

/**
 * Start page banner in the style of the federated learning figures below it: the message on the
 * left, a small looping federation (hospitals exchanging only model updates) on the right.
 */
@Component({
  selector: 'app-start-hero',
  templateUrl: './start-hero.component.html',
  styleUrl: './start-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class StartHeroComponent {
  readonly project = input<string>('FL-Net');
  readonly primaryCtaLabel = input<string>('Start a training');
  readonly secondaryCtaLabel = input<string>('Documentation');

  readonly primaryCta = output<void>();
  readonly secondaryCta = output<void>();

  readonly sites: HeroSite[] = [
    {label: 'Site 1', x: 20, tone: 'violet', delay: 0},
    {label: 'Site 2', x: 160, tone: 'green', delay: 700},
    {label: 'Site N', x: 300, tone: 'brown', delay: 1400},
  ];
}

import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

export type HeroBadge = { label: string; icon?: string };
export type HeroKpi = { label: string; value: string };

@Component({
  selector: 'lib-hero',
  imports: [MatButtonModule, MatChipsModule, MatIconModule, BadgeComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent {
  title = input.required<string>();
  subtitle = input.required<string>();

  eyebrow = input<string | null>(null);

  primaryCtaLabel = input<string>('Request demo');
  secondaryCtaLabel = input<string>('View docs');
  primaryCtaIcon = input<string>('arrow_forward');
  secondaryCtaIcon = input<string>('description');

  badges = input<HeroBadge[]>([]);
  kpis = input<HeroKpi[]>([]);

  primaryCta = output<void>();
  secondaryCta = output<void>();

  hasBadges = computed(() => this.badges().length > 0);
  hasKpis = computed(() => this.kpis().length > 0);
  hasEyebrow = computed(() => !!this.eyebrow());
}

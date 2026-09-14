import {Component, computed, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";

export interface CapabilityItem {
  title: string;
  description: string;
  icon?: string;
  bullets?: string[];
  tag?: string;
}

@Component({
  selector: 'lib-capabilities',
  imports: [
    MatIcon,
    BadgeComponent
  ],
  templateUrl: './capabilities.component.html',
  styleUrl: './capabilities.component.scss',
})
export class CapabilitiesComponent {

  title = input.required<string>();
  subtitle = input<string | null>(null);

  items = input<CapabilityItem[]>([]);

  hasSubtitle = computed(() => !!this.subtitle());
  hasItems = computed(() => this.items().length > 0);
}

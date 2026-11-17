import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";


export type PublishBadeType = 'PUBLISHED' | 'PRIVATE' | 'RESTRICTED';
export type PublishBadgeSize = 'SMALL' | 'MEDIUM' | 'LARGE';

@Component({
  selector: 'lib-publish-badge',
  imports: [
    MatIcon,
    MatTooltip
  ],
  templateUrl: './publish-badge.component.html',
  styleUrl: './publish-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublishBadgeComponent {
  type = input<PublishBadeType>('PRIVATE');
  size = input<PublishBadgeSize>('SMALL');
  animate = input<boolean>(true);
  // shown as tooltip, turns the badge orange
  warning = input<string | undefined>();

  typeClassName = computed(() => this.typeSafe!.toLowerCase());

  className = computed(() =>
    `status-badge ${this.typeClassName()} ${this.size().toLowerCase()} ${this.animate() ? 'animated' : ''} ${this.warning() ? 'warning' : ''}`
  );

  formattedType = computed(() => this.typeSafe.charAt(0).toUpperCase() + this.typeSafe.slice(1).toLowerCase());

  iconName = computed(() => {
    if (this.warning()) {
      return 'warning';
    }
    switch (this.typeSafe) {
      case 'PUBLISHED':
        return 'public';
      case 'PRIVATE':
        return 'lock';
      case 'RESTRICTED':
        return 'admin_panel_settings';
    }
  });

  get typeSafe(){
    return this.type() ?? 'PRIVATE';
  }
}

import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";


export type PublishBadeType = 'PUBLISHED' | 'PRIVATE' | 'RESTRICTED';
export type PublishBadgeSize = 'SMALL' | 'MEDIUM' | 'LARGE';

@Component({
  selector: 'lib-publish-badge',
  imports: [
    MatIcon
  ],
  templateUrl: './publish-badge.component.html',
  styleUrl: './publish-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublishBadgeComponent {
  type = input<PublishBadeType>('PRIVATE');
  size = input<PublishBadgeSize>('SMALL');
  animate = input<boolean>(true);

  typeClassName = computed(() => this.typeSafe!.toLowerCase());

  className = computed(() =>
    `status-badge ${this.typeClassName()} ${this.size().toLowerCase()} ${this.animate() ? 'animated' : ''}`
  );

  formattedType = computed(() => this.typeSafe.charAt(0).toUpperCase() + this.typeSafe.slice(1).toLowerCase());

  iconName = computed(() => {
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

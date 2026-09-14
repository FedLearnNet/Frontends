import {Component, computed, input, output} from '@angular/core';
import {BadgeComponent, BadgeColor, BadgeSize} from '@shared-lib/components/badge/badge.component';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'lib-docker-image-tag',
  imports: [BadgeComponent, MatTooltip],
  templateUrl: './docker-image-tag.component.html',
  styleUrl: './docker-image-tag.component.scss',
})
export class DockerImageTagComponent {
  imageName = input<string>();
  size = input<BadgeSize>('MEDIUM');
  border = input<boolean>(false);
  clickable = input<boolean>(false);
  color = input<BadgeColor>();

  clicked = output<void>();

  hasImage = computed(() => !!this.imageName());

  resolvedColor = computed((): BadgeColor => {
    return this.color() ?? (this.hasImage() ? 'GREEN' : 'ORANGE');
  });

  resolvedIcon = computed(() => this.hasImage() ? 'code' : 'code_off');

  displayTag = computed(() => {
    const img = this.imageName();
    if (!img) return 'No image';
    const lastColon = img.lastIndexOf(':');
    return lastColon === -1 ? img : img.slice(lastColon + 1);
  });

  onClicked(): void {
    if (this.clickable() && this.hasImage()) this.clicked.emit();
  }
}

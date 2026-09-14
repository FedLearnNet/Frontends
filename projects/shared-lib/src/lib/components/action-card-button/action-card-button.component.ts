import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-action-card-button',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './action-card-button.component.html',
  styleUrl: './action-card-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCardButtonComponent {
  title = input<string>('Create a video');
  subtitle = input<string>('From template or blank');
  icon = input<string>('add');

  disabled = input<boolean>(false);
  rounded = input<boolean>(true);
  showIcon = input<boolean>(true);

  routerLink = input<string | undefined>(undefined);
  externalUrl = input<string | undefined>(undefined);

  clicked = output<void>();

  readonly isLink = computed(() => !!this.routerLink() || !!this.externalUrl());

  ariaLabel = computed(() => {
    const title = this.title()?.trim() || 'Action card';
    const subtitle = this.subtitle()?.trim();
    return subtitle ? `${title} – ${subtitle}` : title;
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!this.isLink()) {
      event.stopPropagation();
      this.clicked.emit();
    }
  }
}

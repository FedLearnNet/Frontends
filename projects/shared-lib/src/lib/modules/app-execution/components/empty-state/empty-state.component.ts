import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

export type EmptyStateSize = 'SMALL' | 'MEDIUM' | 'LARGE';

@Component({
  selector: 'lib-empty-state',
  imports: [
    MatIcon,
    MatButton
  ],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.size-small]': "size() === 'SMALL'",
    '[class.size-medium]': "size() === 'MEDIUM'",
  },
})
export class EmptyStateComponent {
  title = input<string>('This is a blank slate');
  subtitle = input<string>('Use it to provide information when no dynamic content exists.');
  icon = input<string>('brightness_empty');

  primaryButtonEnabled = input<boolean>(false);
  primaryButtonLabel = input<string>('Small Button');

  secondaryActionEnabled = input<boolean>(false);
  secondaryActionLabel = input<string>('Secondary action link');

  hasBackground = input<boolean>(false);
  bordered = input<boolean>(false);
  compact = input<boolean>(false);
  /** LARGE fills a page section; SMALL fits side panels and lists. */
  size = input<EmptyStateSize>('LARGE');
  iconBtn = input<boolean>(false);

  cta = output<void>();
  secondaryAction = output<void>();
  rootClicked = output<MouseEvent>();

  ariaLabel = computed(() => {
    const title = this.title()?.trim() || 'Empty state';
    const subtitle = this.subtitle()?.trim() || '';
    return subtitle ? `${title} – ${subtitle}` : title;
  });

  handleRootClick(event: MouseEvent): void {
    this.rootClicked.emit(event);
  }

  handlePrimaryClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.primaryButtonEnabled() || this.iconBtn()) {
      this.cta.emit();
    }
  }

  handleSecondaryClick(event: MouseEvent): void {
    event.stopPropagation();
    this.secondaryAction.emit();
  }
}

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
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('brightness_empty');

  readonly primaryButtonEnabled = input<boolean>(false);
  readonly primaryButtonLabel = input<string>('Small Button');

  readonly secondaryActionEnabled = input<boolean>(false);
  readonly secondaryActionLabel = input<string>('Secondary action link');

  readonly hasBackground = input<boolean>(false);
  readonly bordered = input<boolean>(false);
  readonly compact = input<boolean>(false);
  /** LARGE fills a page section; SMALL fits side panels and lists. */
  readonly size = input<EmptyStateSize>('LARGE');
  readonly iconBtn = input<boolean>(false);

  readonly cta = output<void>();
  readonly secondaryAction = output<void>();
  readonly rootClicked = output<MouseEvent>();

  protected readonly ariaLabel = computed(() => {
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

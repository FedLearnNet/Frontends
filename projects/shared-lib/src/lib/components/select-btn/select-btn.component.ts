import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

export type SelectBtnSize = 'COMPACT' | 'DEFAULT';

@Component({
  selector: 'lib-select-btn',
  imports: [MatIcon],
  templateUrl: './select-btn.component.html',
  styleUrl: './select-btn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.select-btn-host--compact]': 'size() === "COMPACT"',
  },
})
export class SelectBtnComponent {
  title = input.required<string>();
  description = input<string>('');
  icon = input<string>('check_box_outline_blank');
  selected = input<boolean>(false);
  disabled = input<boolean>(false);
  size = input<SelectBtnSize>('DEFAULT');
  ariaLabel = input<string>();

  clicked = output<void>();

  readonly resolvedAriaLabel = computed(() => {
    if (this.ariaLabel()) return this.ariaLabel();
    const description = this.description().trim();
    return description ? `${this.title()} – ${description}` : this.title();
  });

  select(): void {
    if (!this.disabled()) this.clicked.emit();
  }
}

import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

import {FunctionExecutionMode, FunctionsDetailDTO} from '../../../../../dto/function';
import {StoreDTO} from '@shared-lib/modules/store/dto/store';
import {BadgeColor, BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {modeDescriptionKey, modeIcon, modeLabelKey} from './transformer-mode';

/**
 * Generic selectable list row used by the transformer manager for both
 * built-in transformation methods and tool-store apps, so the two sources
 * share one look. Pass either a [function] or a [store] element; the row
 * derives icon, title, badge, and description from it.
 */
@Component({
  selector: 'app-transformer-tool-list-item',
  standalone: true,
  imports: [MatIconModule, TranslatePipe, BadgeComponent],
  templateUrl: './tool-list-item.component.html',
  styleUrl: './tool-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformerToolListItemComponent {
  readonly function = input<FunctionsDetailDTO | null>(null);
  readonly store = input<StoreDTO | null>(null);
  readonly showModule = input<boolean>(false);
  readonly selected = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly disabledReason = input<string>('');

  readonly activated = output<void>();

  private readonly app = computed(() => this.store()?.app ?? null);

  readonly icon = computed(() => this.app() ? 'widgets' : modeIcon(this.function()?.mode));
  readonly label = computed(() => this.app()?.name ?? this.function()?.methodName ?? '');
  readonly meta = computed(() => this.showModule() ? (this.function()?.moduleName ?? '') : '');

  readonly description = computed(() =>
    this.app()?.shortDescription ?? this.function()?.description ?? '');
  readonly descriptionFallbackKey = computed(() => {
    const fn = this.function();
    return !this.app() && fn ? modeDescriptionKey(fn.mode) : '';
  });

  readonly badgeIcon = computed(() => {
    const fn = this.function();
    return !this.app() && fn ? modeIcon(fn.mode) : '';
  });
  readonly badgeLabelKey = computed(() => {
    const fn = this.function();
    return !this.app() && fn ? modeLabelKey(fn.mode) : '';
  });
  readonly badgeText = computed(() => {
    const version = this.app()?.latestVersion;
    return version ? 'v' + version : '';
  });
  readonly badgeColor = computed<BadgeColor>(() => {
    switch (this.function()?.mode) {
      case FunctionExecutionMode.CELL:
        return 'BLUE';
      case FunctionExecutionMode.ROW:
        return 'ORANGE';
      case FunctionExecutionMode.PATIENT:
        return 'GREEN';
      default:
        return 'GRAY';
    }
  });
}

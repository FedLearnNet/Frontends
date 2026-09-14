import {ChangeDetectionStrategy, Component, computed, input, output} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {SearchResultDTO} from '../../dto/search-result';
import {searchResultMeta} from '../../constants/search-navigation';

@Component({
  selector: 'app-search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrl: './search-result-card.component.scss',
  imports: [MatIconModule, TranslatePipe, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultCardComponent {
  item = input.required<SearchResultDTO>();
  active = input<boolean>(false);

  selected = output<SearchResultDTO>();

  readonly meta = computed(() => searchResultMeta(this.item().type));
  readonly navigable = computed(() => this.meta().route(this.item()) !== null);

  onSelect(): void {
    this.selected.emit(this.item());
  }
}

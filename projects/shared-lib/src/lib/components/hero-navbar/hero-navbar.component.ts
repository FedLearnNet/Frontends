import {ChangeDetectionStrategy, Component, computed, input, model, output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";

export type HeroNavbarSize = 'X-SMALL' | 'SMALL' | 'MEDIUM' | 'LARGE';
export type HeroNavbarColor =
  'GREEN'
  | 'GRAY'
  | 'RED'
  | 'ORANGE'
  | 'BLUE'
  | 'WHITE'
  | 'DARK-TEAL'
  | 'DARK-SLATE';
export type HeroNavbarLayout = 'OVERVIEW' | 'DETAIL' | 'COMPACT';

@Component({
  selector: 'lib-hero-navbar',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './hero-navbar.component.html',
  styleUrl: './hero-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroNavbarComponent {
  eyebrow = input<string>();
  title = input<string>();
  description = input<string>();
  color = input<HeroNavbarColor>('WHITE');
  size = input<HeroNavbarSize>('MEDIUM');
  border = input<boolean>(true);
  wrap = input<boolean>(false);
  fullWidth = input<boolean>(false);
  uppercase = input<boolean>(false);
  layout = input<HeroNavbarLayout>('DETAIL');

  enableGoBack = input<boolean>(false);
  enableSearch = input<boolean>(false);
  enableSkeleton = input<boolean>(false);

  searchValue = model<string>('');
  searchPlaceholder = input<string>('Search by name, status or keyword');
  searchLabel = input<string>('Search');
  searchHint = input<string>();
  searchInputType = input<'search' | 'text'>('search');
  searchDisabled = input<boolean>(false);

  goBackLabel = input<string>('Back');
  goBackAriaLabel = input<string>('Go back');
  showGoBackLabel = input<boolean>(false);
  goBackIcon = input<string>('arrow_back');

  className = computed(() =>
    `hero-navbar ${this.size().toLowerCase()}
    ${this.color().toLowerCase()}
    ${this.layout().toLowerCase()}
    ${this.border() ? 'border' : ''}
    ${this.wrap() ? 'wrap' : ''}
    ${this.enableSearch() ? 'has-search' : ''}
    ${this.enableGoBack() ? 'has-back' : ''}
    ${this.fullWidth() ? 'full-width' : ''}`
  );

  formattedEyebrow = computed(() => {
    const text = this.eyebrow();
    if (!text) {
      return '';
    }

    return this.uppercase()
      ? text.toUpperCase()
      : text.charAt(0).toUpperCase() + text.slice(1);
  });

  goBack = output<void>();
  keyInput = output<KeyboardEvent>();
  searchInput = output<string>();
  searchSubmit = output<string>();

  showHeading = computed(() => !!(this.eyebrow() || this.title() || this.description()));

  handleSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.searchValue.set(value);
    this.searchInput.emit(value);
  }

  handleSearchKeydown(event: KeyboardEvent): void {
    this.keyInput.emit(event);

    if (event.key === 'Enter') {
      this.searchSubmit.emit(this.searchValue().trim());
    }
  }

  clearSearch(): void {
    this.searchValue.set('');
    this.searchInput.emit('');
  }
}

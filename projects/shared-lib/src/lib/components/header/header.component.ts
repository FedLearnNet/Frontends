import {ChangeDetectionStrategy, Component, computed, inject, input, model, output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {Location} from "@angular/common";
import {Router} from "@angular/router";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";


@Component({
  selector: 'lib-header',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    SkeletonLoaderComponent,
    BtnComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly location: Location = inject(Location);
  private readonly router: Router = inject(Router);

  title = input<string>();
  description = input<string>();
  border = input<boolean>(true);
  wrap = input<boolean>(false);
  uppercase = input<boolean>(false);
  mainGap = input<boolean>(true);

  enableGoBack = input<boolean>(false);
  locationBack = input<boolean>(false);
  routerOnePathBack = input<boolean>(false);
  enableSearch = input<boolean>(false);
  enableSearchSuffix = input<boolean>(false);
  enableSkeleton = input<boolean>(false);
  enableAddBtn = input<boolean>(false);
  hasCustomTitle = input<boolean>(false);

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

  addBtnLabel = input<string>('Add');
  addBtnIcon = input<string>('add');
  addBtnAriaLabel = input<string>('Add Item');

  className = computed(() =>
    `hero-navbar
    ${this.border() ? 'border' : ''}
    ${this.mainGap() ? 'maingap' : ''}
    ${this.wrap() ? 'wrap' : ''}
    ${this.enableSearch() ? 'has-search' : ''}
    ${this.enableGoBack() ? 'has-back' : ''}`
  );

  goBack = output<void>();
  keyInput = output<KeyboardEvent>();
  searchInput = output<string>();
  searchSubmit = output<string>();
  addBtnClick = output<void>();


  showHeading = computed(() => !!(this.title() || this.description() || this.hasCustomTitle()));

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

  onGoBackHandler(): void {
    if (this.locationBack()) {
      this.location.back();
    }
    if (this.routerOnePathBack()) {
      const currentUrl = this.router.url;
      const [pathWithQuery] = currentUrl.split('#');
      const [path, queryString] = pathWithQuery.split('?');
      const segments = path.split('/').filter(Boolean);
      if (segments.length <= 1) {
        this.router.navigateByUrl('/');
        return;
      }
      const parentPath = '/' + segments.slice(0, -1).join('/');
      this.router.navigateByUrl(
        queryString ? `${parentPath}?${queryString}` : parentPath
      );
      return;
    } else {
      this.goBack.emit();
    }
  }
}

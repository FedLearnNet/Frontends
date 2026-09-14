import {Component, computed, HostListener, inject, input, OnInit, output, signal} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {TranslatePipe} from "@ngx-translate/core";
import {StoreFilterComponent} from "@shared-lib/modules/store/components/store-filter/store-filter.component";
import {Store} from "@ngrx/store";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {selectStoreList, selectStoreLoading, selectTotalItems} from "@shared-lib/modules/store/store/store.selectors";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {debounceTime, fromEvent} from "rxjs";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {StoreConfig} from '@shared-lib/models';

@Component({
  selector: 'lib-store-list',
  imports: [
    MatButton,
    TranslatePipe,
    StoreFilterComponent,
    StoreCardComponent,
    MatProgressSpinner
  ],
  templateUrl: './store-list.component.html',
  styleUrl: './store-list.component.scss'
})
export class StoreListComponent implements OnInit {
  private readonly store: Store = inject(Store);

  linkToShop = input<boolean>();
  storeConfig = input<StoreConfig | undefined>();

  itemClicked = output<StoreDTO>();

  public storeItems = toSignal(this.store.select(selectStoreList), {initialValue: []});
  public readonly isLoading = toSignal(this.store.select(selectStoreLoading), {initialValue: false});
  public readonly totalItems = toSignal(this.store.select(selectTotalItems), {initialValue: 0});

  isMobile = signal<boolean>(false);
  isMobileFilterActive = signal<boolean>(false);

  useLink = computed(() => {
    const link = this.linkToShop();
    if (link === undefined) {
      return true;
    }
    return link;
  })

  @HostListener('window:resize', ['$event'])
  onResize(_event: Event) {
    this.isMobile.set(window.innerWidth <= 768);
  }

  constructor() {
    fromEvent(window, 'scroll').pipe(
      takeUntilDestroyed(),
      debounceTime(100)
    ).subscribe(() => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const scrollHeight = document.body.scrollHeight;
      this.onScroll(scrollPosition, scrollHeight);
    });
  }

  ngOnInit() {
    this.isMobile.set(window.innerWidth <= 768);
    const storeConfig = this.storeConfig();
    const hideWorkflow = storeConfig?.hideWorkflow ?? false;
    const appTypeFilters = storeConfig && storeConfig.prefilter ?
      storeConfig.prefilter.appType.map(f => f as string) : undefined;

    if (this.storeItems().length === 0) {
      this.store.dispatch(StoreActions.loadList({params: {page: 0, appTypes: appTypeFilters, hideWorkflow}}));
    }
  }

  toggleMobileFilter() {
    this.isMobileFilterActive.update(s => !s);
  }

  public itemClick(storeElement: StoreDTO) {
    if (this.useLink()) {
      return;
    }
    this.itemClicked.emit(storeElement);
  }

  public onScroll(scrollPosition: number, scrollHeight: number): void {
    if (this.isLoading()) return;
    if (this.storeItems().length >= this.totalItems()) return;

    const buffer = 150;

    if (scrollPosition >= scrollHeight - buffer) {
      this.loadNextPage();
    }
  }


  private loadNextPage(): void {
    this.store.dispatch(StoreActions.loadNextPage());
  }


}

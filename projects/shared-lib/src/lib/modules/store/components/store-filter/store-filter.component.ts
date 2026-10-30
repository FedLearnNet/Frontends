import {Component, computed, effect, inject, input, signal, ChangeDetectionStrategy} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatIconButton} from "@angular/material/button";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatDivider} from "@angular/material/divider";
import {MatFormField, MatInput, MatLabel, MatSuffix} from "@angular/material/input";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {Filter} from "@shared-lib/modules/store/components/model/filter";
import {FederatedAppType} from "@shared-lib/modules/store/dto/enum";
import {MatIcon} from "@angular/material/icon";
import {takeUntilDestroyed, toSignal} from "@angular/core/rxjs-interop";
import {debounceTime, Observable, Subject} from "rxjs";
import {StoreFilterParams} from "@shared-lib/modules/store/dto/store.filter";
import {Store} from "@ngrx/store";
import {StoreActions} from "@shared-lib/modules/store/store/store.actions";
import {selectListRequestParams} from "@shared-lib/modules/store/store/store.selectors";
import {StoreConfig} from '@shared-lib/models';

@Component({
  selector: 'lib-store-filter',
  imports: [
    FormsModule,
    MatCheckbox,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatRadioButton,
    MatRadioGroup,
    MatSuffix,
    TranslatePipe,
    MatFormField,
    MatIcon
  ],
  templateUrl: './store-filter.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './store-filter.component.scss'
})
export class StoreFilterComponent {
  private readonly translate = inject(TranslateService);
  private readonly store: Store = inject(Store);


  readonly isMobile = signal(false);
  readonly isMobileFilterActive = signal(false);

  searchQuery = signal('');
  readonly appTypes = signal<Filter[]>([]);
  readonly privacyTechniques = signal<Filter[]>([]);
  readonly ratings = signal<number[]>([1, 2, 3, 4, 5]);

  readonly showUncertified = signal<boolean>(true);
  readonly selectedRating = signal<string>('showAll');

  private readonly filterChanges$ = new Subject<void>();

  readonly storeConfig = input<StoreConfig | undefined>();

  stars = (n: number) => Array.from({length: n});

  preFilteredAppTypes = computed<FederatedAppType[] | undefined>(() => {
    const storeConfig = this.storeConfig();
    if (!storeConfig) {
      return [];
    }
    if (!storeConfig.prefilter) {
      return [];
    }
    return storeConfig.prefilter.appType ?? [];
  });
  needsFilterAppTypes = computed(() => !(this.preFilteredAppTypes()!.length > 0));
  hideWorkflow = computed(() => this.storeConfig()?.hideWorkflow ?? false);
  appTypeFilterChangeable = computed(() => this.storeConfig()?.allowFilterChange?.appType ?? true);
  showAppTypeFilter = computed(() => this.needsFilterAppTypes() || this.appTypeFilterChangeable());

  // with a prefilter only its categories are selectable, plus workflow
  visibleAppTypes = computed(() => {
    const selectable = this.storeConfig()?.filterAppTypes ?? this.preFilteredAppTypes() ?? [];
    return this.appTypes().filter(t => {
      if (t.id === 'workflow') return !this.hideWorkflow();
      return selectable.length === 0 || selectable.includes(t.id as FederatedAppType);
    });
  });

  constructor() {
    const resize$ = typeof window !== 'undefined' ?
      new Observable<number>((subscriber) => {
        const handler = () => subscriber.next(window.innerWidth);
        handler();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
      }) : undefined;

    if (resize$) {
      const widthSig = toSignal(resize$, {initialValue: 1024});
      effect(() => {
        this.isMobile.set(widthSig() <= 768);
      });
    }

    this.translate
      .get([
        'PRE_PROCESSING',
        'ANALYSIS',
        'POST_PROCESSING',
        'EVALUATION',
        'FEDERATED_COMPUTATION',
        'DIFFERENTIAL_PRIVACY',
        'SECURE_MULTI_PARTY_COMPUTATION',
        'DATA_TRANSFORMATION',
        'SELF_LEARNED',
        'EXTRACTOR',
        'INFERENCE',
        'WORKFLOW'
      ])
      .subscribe((t) => {
        this.appTypes.set([
          {name: t['PRE_PROCESSING'], id: FederatedAppType.PRE_PROCESSING},
          {name: t['ANALYSIS'], id: FederatedAppType.ANALYSIS},
          {name: t['POST_PROCESSING'], id: FederatedAppType.POST_PROCESSING},
          {name: t['EVALUATION'], id: FederatedAppType.EVALUATION},
          {name: t['DATA_TRANSFORMATION'], id: FederatedAppType.DATA_TRANSFORMATION},
          {name: t['SELF_LEARNED'], id: FederatedAppType.SELF_LEARNED},
          {name: t['EXTRACTOR'], id: FederatedAppType.EXTRACTOR},
          {name: t['INFERENCE'], id: 'model'},
          {name: t['WORKFLOW'], id: 'workflow'},
        ]);
        this.privacyTechniques.set([
          {name: t['FEDERATED_COMPUTATION'], id: 'fc'},
          {name: t['DIFFERENTIAL_PRIVACY'], id: 'dp'},
          {name: t['SECURE_MULTI_PARTY_COMPUTATION'], id: 'smc'},
        ]);
      });

    const storeParams = this.store.selectSignal(selectListRequestParams);
    effect(() => {
      const params = storeParams();
      if (params) {
        this.searchQuery.set(params.search || '');
        this.showUncertified.set(params.showUncertified ?? true);
        //TODO AND SO ONE
      }
    });

    this.filterChanges$.pipe(
      debounceTime(400),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  onFilterChange(): void {
    this.filterChanges$.next();
  }

  applyFilters(): void {
    const params: StoreFilterParams = {
      search: this.searchQuery(),
      showUncertified: this.showUncertified(),
      minRating: this.selectedRating() === 'showAll' ? null : parseInt(this.selectedRating(), 10),
      appTypes: this.appTypeFilters(),
      privacyTechniques: this.privacyTechniques().filter(f => f.checked).map(f => f.id as string),
      page: 0,
      hideWorkflow: this.hideWorkflow(),
      onlyWithImage: this.storeConfig()?.onlyWithImage,
    };
    this.store.dispatch(StoreActions.loadList({params}));
  }

  private appTypeFilters(): string[] {
    const checked = this.visibleAppTypes().filter(f => f.checked).map(f => f.id);
    const preFiltered = this.preFilteredAppTypes() ?? [];
    if (preFiltered.length === 0) return checked;
    if (!this.appTypeFilterChangeable()) return preFiltered;

    // nothing checked falls back to the prefilter, workflow alone lists all workflows
    const categories = checked.filter(id => id !== 'workflow');
    const workflow = checked.includes('workflow') ? ['workflow'] : [];
    if (categories.length > 0) return [...categories, ...workflow];
    return workflow.length > 0 ? workflow : preFiltered;
  }

  toggleMobileFilter() {
    this.isMobileFilterActive.update((v) => !v);
  }

  clearSearchQuery() {
    this.searchQuery.set('');
    this.onFilterChange();

  }

  toggleAppType(item: Filter) {
    this.appTypes.update((arr) => arr.map((x) => x.id === item.id ? {...x, checked: !x.checked} : x));
    this.onFilterChange();
  }

  togglePrivacyTechnique(item: Filter) {
    this.privacyTechniques.update((arr) => {
      const idx = arr.findIndex((x) => x.id === item.id);
      if (idx >= 0) arr[idx] = {...arr[idx], checked: !arr[idx].checked} as Filter;
      return arr;
    });
    this.onFilterChange();

  }
}

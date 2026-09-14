import {Component, computed, DestroyRef, HostListener, inject, OnInit, signal} from '@angular/core';
import {environment} from '@local-app/env/environment';
import {TranslateService} from "@ngx-translate/core";
import {RouterLink, RouterOutlet} from "@angular/router";
import {BreadcrumbComponent} from '@shared-lib/components/breadcrumb/breadcrumb.component';
import {SidenavComponent} from "@shared-lib/components/sidenav/sidenav.component";
import {UserMenuComponent} from "@shared-lib/components/user-menu/user-menu.component";
import {FooterComponent, FooterGroup} from "@shared-lib/components/footer/footer.component";
import {NavItem, NavSection} from "@shared-lib/models/navigation";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {CohortStarService} from "@local-app/utils/services/cohort-star.service";
import {CohortService} from "@local-app/cohort/services/cohort.service";
import {CohortDto} from "@local-app/cohort/models";
import {Store} from "@ngrx/store";
import {MatDialog} from "@angular/material/dialog";
import {NotificationActions} from "@local-app/information/store/notification.actions";
import {selectReviewCounts, selectUnreadCount} from "@local-app/information/store/notification.selectors";
import {
  NotificationDialogComponent
} from "@local-app/information/components/notification-dialog/notification-dialog.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {
  SearchOverlayComponent
} from "./modules/search/components/search-overlay/search-overlay.component";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    BreadcrumbComponent,
    SidenavComponent,
    UserMenuComponent,
    FooterComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly authState = inject(AuthStateService);
  private readonly cohortStars = inject(CohortStarService);
  private readonly cohortService = inject(CohortService);
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly unreadCount = this.store.selectSignal(selectUnreadCount);
  readonly reviewCounts = this.store.selectSignal(selectReviewCounts);

  title = environment.appTitle;
  project = environment.project;

  readonly footerGroups: FooterGroup[] = [
    {
      title: 'About FlNet',
      links: [
        {label: 'About', href: 'https://www.cosy.bio/'},
        {label: 'Contact', href: 'https://www.cosy.bio/contact'},
        {label: 'Imprint', href: 'https://www.cosy.bio/contact'},
      ],
    },
  ];

  menuCollapsed = signal<boolean>(false);

  private searchDialogRef?: MatDialogRef<SearchOverlayComponent>;

  private readonly cohorts = signal<CohortDto[]>([]);

  readonly starredIds = this.cohortStars.starredIds;

  readonly sections = computed<NavSection[]>(() => {
    const starred = this.cohorts().filter(c => this.starredIds().includes(String(c.id)));
    const reviews = this.reviewCounts();
    const unread = this.unreadCount();

    const baseSections: NavSection[] = [];

    if (starred.length > 0) {
      baseSections.push({
        title: 'MENU.STARRED',
        items: starred.map(c => this.cohortToNavItem(c)),
      });
    }

    baseSections.push({
      title: 'MENU.COHORTS',
      items: [
        {
          id: 'cohorts',
          label: 'MENU.COHORT', icon: 'layers', route: ['/cohort'],
          badge: this.cohorts().length || undefined,
          children: this.cohorts().map(c => this.cohortToNavItem(c)),
        },
      ],
    });

    baseSections.push({
      title: 'MENU.REQUESTS',
      items: [
        {
          label: 'MENU.TRAINING_REVIEW', icon: 'rule', route: ['/data-review/training'],
          ...(reviews.training ? {badge: reviews.training} : {}),
        },
        {
          label: 'MENU.STATISTICS_REVIEW', icon: 'analytics', route: ['/data-review/statistics'],
          ...(reviews.statistics ? {badge: reviews.statistics} : {}),
        },
        {
          label: 'MENU.METRICS_REVIEW', icon: 'monitoring', route: ['/data-review/metrics'],
          ...(reviews.metrics ? {badge: reviews.metrics} : {}),
        },
      ],
    });

    baseSections.push({
      title: 'MENU.GOVERNANCE',
      items: [
        {label: 'MENU.TRAINING', icon: 'model_training', route: ['/training']},
        {label: 'MENU.PERMISSIONS', icon: 'shield', route: ['/data-review/permissions']},
        {label: 'MENU.LOGS', icon: 'description', route: ['/logs']},
        {
          label: 'MENU.INFORMATION', icon: 'notifications', route: ['/information'],
          ...(unread ? {badge: unread} : {}),
        },
      ],
    });

    baseSections.push({
      title: 'OPERATIONS',
      items: [
        {label: 'MENU.SCHEMA', icon: 'account_tree', route: ['/schema']},
        {label: 'MENU.ADMIN', icon: 'admin_panel_settings', route: ['/admin']},
      ],
    });

    return this.filterAdminSections(baseSections);
  });

  ngOnInit() {
    document.title = environment.appTitle;

    const savedLang = localStorage.getItem('language') || 'en'
    this.translate.addLangs([savedLang]);
    this.translate.setFallbackLang(savedLang);
    this.translate.use(savedLang);

    this.loadCohorts();
    this.cohortService.cohortsChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadCohorts());
    this.store.dispatch(NotificationActions.loadUserInfo());
  }

  onToggle() {
    this.menuCollapsed.update(v => !v);
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  openSearch() {
    if (this.searchDialogRef) {
      return;
    }
    this.searchDialogRef = this.dialog.open(SearchOverlayComponent, {
      width: '600px',
      maxWidth: '95vw',
      position: {top: '12vh'},
      autoFocus: true,
      panelClass: 'search-overlay-panel',
    });
    this.searchDialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.searchDialogRef = undefined);
  }

  openNotifications() {
    this.dialog.open(NotificationDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      autoFocus: false,
      panelClass: 'notification-dialog-panel',
    });
  }

  onStarToggle(item: NavItem) {
    if (item.id) {
      this.cohortStars.toggle(item.id);
    }
  }

  private loadCohorts() {
    this.cohortService.getCohorts().subscribe({
      next: cohorts => this.cohorts.set(cohorts ?? []),
      error: () => this.cohorts.set([]),
    });
  }

  private cohortToNavItem(c: CohortDto): NavItem {
    return {
      id: String(c.id),
      label: c.name,
      icon: 'circle',
      route: ['/cohort', c.id],
      starrable: true,
    };
  }

  private filterAdminSections(sections: NavSection[]): NavSection[] {
    if (this.authState.isAdmin()) {
      return sections;
    }

    return sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.label !== 'MENU.ADMIN')
      }))
      .filter(section => section.items.length > 0);
  }
}

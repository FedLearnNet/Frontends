import {Component, EventEmitter, HostListener, inject, Input, OnInit, Output} from '@angular/core';
import {AppService} from "../../service/app.service";
import {map, Observable} from "rxjs";
import {AppDto} from "../../dto/app";
import {Filter} from "../../model/filter";
import {FederatedAppType} from "@global-app/app-store/dto/enum";

@Component({
  selector: 'app-app-list',
  templateUrl: './app-list.component.html',
  styleUrl: './app-list.component.scss'
})
export class AppListComponent implements OnInit {
  @Input() linkToShop?: boolean = true;
  @Output() itemClicked = new EventEmitter<AppDto>();


  private appService: AppService = inject(AppService);

  public apps$: Observable<AppDto[]>;
  private appsOg: AppDto[] = [];
  public apps: AppDto[] = [];

  isMobile: boolean = false;
  isMobileFilterActive: boolean = false;

  searchQuery: string = '';


  appTypes: Filter[] = [
    {name: 'Pre-processing', id: FederatedAppType.PRE_PROCESSING},
    {name: 'Analysis', id: FederatedAppType.ANALYSIS},
    {name: 'Post-processing', id: FederatedAppType.POST_PROCESSING},
    {name: 'Evaluation', id: FederatedAppType.EVALUATION},
  ];

  privacyTechniques: Filter[] = [
    {name: 'Federated computation', id: 'fc'},
    {name: 'Differential privacy', id: 'dp'},
    {name: 'Secure Multi-party Computation', id: 'smc'},
  ];

  frontendAvailable: Filter[] = [
    {name: 'Frontend available', id: 'fa'},
    {name: 'No frontend available', id: 'nfa'},
  ];

  ratings: number[] = [1, 2, 3, 4, 5];

  //models
  showUncertified: boolean = true;
  selectedRating: string = 'showAll';


  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;

    if(this.linkToShop == undefined) {
      this.linkToShop = true;
    }

    this.apps$ = this.appService.getApps();
    this.apps$.subscribe(apps => {
      this.appsOg = apps;
      this.apps = this.appsOg;
    })
  }

  public itemClick(app: AppDto) {
    if (this.linkToShop) {
      return;
    }
    this.itemClicked.emit(app);
  }

  toggleMobileFilter() {
    this.isMobileFilterActive = !this.isMobileFilterActive;
  }

  clearSearchQuery() {
    this.searchQuery = '';
    this.appFiltered();
  }

  public appFiltered() {
    this.apps = this.appsOg
      .filter((app) => this.uncertifiedFilter(app))
      .filter((app) => this.ratingFilter(app))
      .filter((app) => this.privacyTechniquesFilter(app))
      .filter((app) => this.categoryFilterFilter(app))
      .filter((app) => this.frontendFilter(app))
      .filter((app) => this.searchFilter(app));
  }

  private uncertifiedFilter(app: AppDto): boolean {
    if (this.showUncertified) {
      return true;
    }
    return app.certificationLevel > 0;
  }

  private searchFilter(app: AppDto): boolean {
    const filter = this.searchQuery.trim().toLowerCase();
    return (app.name.toLowerCase().includes(filter)) ||
      (app.shortDescription.toLowerCase().includes(filter)) ||
      (app.longDescription.toLowerCase().includes(filter));
  }

  private ratingFilter(app: AppDto): boolean {
    if (this.selectedRating === 'showAll') {
      return true;
    }
    return !!(app.average && app.average >= parseInt(this.selectedRating));

  }

  private privacyTechniquesFilter(app: AppDto): boolean {
    if (!app.tags || app.tags.length === 0) {
      return false;
    }
    const checked = this.privacyTechniques
      .filter(filter => filter.checked);

    if (checked.length === 0) {
      return true;
    }

    const tags = app.tags.filter(tag => tag.privacy);

    return checked.every(filter => tags.find(tag => tag.name === filter.name));
  }


  private categoryFilterFilter(app: AppDto): boolean {
    const checked = this.appTypes
      .filter(filter => filter.checked);

    if (checked.length === 0) {
      return true;
    }

    return checked.some(filter => filter.id === app.type);
  }

  private frontendFilter(app: AppDto): boolean {
    const checked = this.frontendAvailable
      .filter(filter => filter.checked);

    if (checked.length === 0) {
      return true;
    }

    return checked
      .some(filter => (filter.id === 'fa' && app.hasFrontend) || (filter.id === 'nfa' && !app.hasFrontend));
  }
}

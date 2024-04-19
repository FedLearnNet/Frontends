import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Model } from '../../models';
import { ModelService } from '../../services/model.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { LARGE, MEDIUM, SMALL, XLARGE, XSMALL } from '@shared-lib/constants';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss',
})
export class StoreComponent {
  models: Model[];
  gridBreakpoint: number = 4;

  @Input() filterChangeEvent: Observable<{}>;

  private filterChangeEventSubscription: Subscription;

  constructor(
      private modelService: ModelService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({models}) => this.models = models);

    this.checkAndAdjustResponsiveLayout();

    this.filterChangeEventSubscription = this.filterChangeEvent
        .subscribe((filterData) => this.getModels(filterData));
  }

  ngOnDestroy(): void {
    this.filterChangeEventSubscription.unsubscribe();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => {
          switch (screenSize) {
            case XLARGE:
              this.gridBreakpoint = 6;
              break;
            case LARGE:
              this.gridBreakpoint = 4;
              break;
            case MEDIUM:
              this.gridBreakpoint = 3;
              break;
            case SMALL:
              this.gridBreakpoint = 2;
              break;
            case XSMALL:
              this.gridBreakpoint = 1;
              break;
          }
        });
  }

  getModels(filterData: {} = {}): void {
    this.modelService
        .getModels(filterData)
        .subscribe(models => this.models = models);
  }
}


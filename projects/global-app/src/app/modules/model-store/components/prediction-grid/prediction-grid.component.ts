import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PredictionResultDetailComponent } from './components/prediction-result-detail/prediction-result-detail.component';
import { Observable, Subscription } from 'rxjs';
import { Prediction } from '../../models';
import { ModelService } from '../../services/model.service';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';

@Component({
  selector: 'app-prediction-grid',
  templateUrl: './prediction-grid.component.html',
  styleUrl: './prediction-grid.component.scss',
})
export class PredictionGridComponent {
  isXSmallScreen: boolean = false;
  predictions: Prediction[] = [];
  displayedColumns: string[] = ['actions', 'name', 'status', 'date'];

  @Input() filterChangeEvent: Observable<{}>;

  private filterChangeEventSubscription: Subscription;

  constructor(
      public dialog: MatDialog,

      private modelService: ModelService,
      private activatedRoute: ActivatedRoute,
      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({predictions}) => this.predictions = predictions);

    this.checkAndAdjustResponsiveLayout();

    this.filterChangeEventSubscription = this.filterChangeEvent
        .subscribe((filterData) => this.getPredictions(filterData));
  }

  ngOnDestroy(): void {
    this.filterChangeEventSubscription.unsubscribe();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  getPredictions(filterData: {} = {}): void {
    this.modelService
        .getPredictions(filterData)
        .subscribe(predictions => this.predictions = predictions);
  }

  showPredictionResult(predictionId: number): void {
    this.dialog.open(PredictionResultDetailComponent, {
      minWidth: '70%',
      data: {
        predictionId: predictionId,
      },
    });
  }
}

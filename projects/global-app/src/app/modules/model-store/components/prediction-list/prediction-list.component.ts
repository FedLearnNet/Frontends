import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {ResponsiveService} from "@shared-lib/services/responsive.service";
import {XSMALL} from "@shared-lib/constants";
import {
  PredictionResultDetailComponent
} from "@global-app/model-store/components/prediction-result-detail/prediction-result-detail.component";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {PredictionDto} from "@global-app/model-store/dto/prediction";
import {PredictionService} from "@global-app/model-store/services/prediction.service";

@Component({
  selector: 'app-prediction-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    CommonModule,
    MatFormField,
    MatInput,
    MatLabel,
    RouterLink
  ],
  templateUrl: './prediction-list.component.html',
  styleUrl: './prediction-list.component.scss'
})
export class PredictionListComponent implements OnInit {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly predictionService: PredictionService = inject(PredictionService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly responsiveService: ResponsiveService = inject(ResponsiveService);

  @Input() modelId?: number;

  routeMode: boolean = true;

  isXSmallScreen: boolean = false;
  predictions: PredictionDto[] = [];
  displayedColumns: string[] = ['name', 'status', 'date', 'actions'];

  dataSource: MatTableDataSource<PredictionDto> = new MatTableDataSource();

  ngOnInit(): void {
    if(this.modelId) {
      this.routeMode = false;
      this.getPredictions(this.modelId);
    }

    if (this.routeMode) {
      this.activatedRoute.data.subscribe(({predictions}) => {
        this.predictions = predictions
        this.dataSource.data = predictions;
      });
    }

    this.checkAndAdjustResponsiveLayout();

  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
      .getScreenSize()
      .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
  }

  getPredictions(modelId: number): void {
    this.predictionService
      .getPredictionsForModel(modelId)
      .subscribe(predictions => {
        this.predictions = predictions
        this.dataSource.data = predictions;
      });
  }

  showPredictionResult(prediction: PredictionDto): void {
    this.dialog.open(PredictionResultDetailComponent, {
      minWidth: '70%',
      data: prediction
    });
  }
}

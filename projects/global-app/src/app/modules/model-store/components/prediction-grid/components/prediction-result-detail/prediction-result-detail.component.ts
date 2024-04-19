import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModelService } from '../../../../services/model.service';

@Component({
  selector: 'app-prediction-result-detail',
  templateUrl: './prediction-result-detail.component.html',
  styleUrl: './prediction-result-detail.component.scss',
})
export class PredictionResultDetailComponent {
  predictionResults: any[] = [];
  displayedColumns: string[] = ['id', 'value'];

  constructor(
      public dialogRef: MatDialogRef<PredictionResultDetailComponent>,

      @Inject(MAT_DIALOG_DATA) public data: any,

      private modelService: ModelService,
  ) { }

  ngOnInit(): void {
    this.getPredictionResults(this.data.predictionId);
  }

  getPredictionResults(predictionId: number): void {
    this.modelService
        .getPredictionResults(predictionId)
        .subscribe(predictionResults => this.predictionResults = predictionResults);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

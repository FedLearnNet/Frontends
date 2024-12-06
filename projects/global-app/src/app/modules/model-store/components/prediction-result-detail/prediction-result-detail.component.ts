import {Component, inject, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {CommonModule} from "@angular/common";
import {MatDividerModule} from "@angular/material/divider";
import {DataTypeDTO} from "@global-app/schema/dto/datatype";
import {PredictionDto} from "@global-app/model-store/dto/prediction";

@Component({
  selector: 'app-prediction-result-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
    CommonModule
  ],
  templateUrl: './prediction-result-detail.component.html',
  styleUrl: './prediction-result-detail.component.scss',
})
export class PredictionResultDetailComponent {
  private readonly dialogRef: MatDialogRef<PredictionResultDetailComponent> = inject(MatDialogRef);
  readonly prediction = inject<PredictionDto>(MAT_DIALOG_DATA);

  predictionResults: any[] = [];
  displayedColumns: string[] = ['id', 'value'];


  onCancel(): void {
    this.dialogRef.close();
  }
}

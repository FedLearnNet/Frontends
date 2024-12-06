import {Component, inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {PatientDataTraceabilityLogDto} from "../dto/logs";
import {MatTabsModule} from "@angular/material/tabs";

@Component({
  selector: 'app-patient-update-log-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatTabsModule
  ],
  templateUrl: './patient-update-log-detail.component.html',
  styleUrl: './patient-update-log-detail.component.scss'
})
export class PatientUpdateLogDetailComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<PatientUpdateLogDetailComponent>);
  readonly data = inject<PatientDataTraceabilityLogDto>(MAT_DIALOG_DATA);

  currentData: { [key: string]: any } = {};
  previousData: { [key: string]: any } = {};

  ngOnInit() {
    const currentData = JSON.parse(this.data.currentData);
    if (currentData && currentData.length > 0) {
      this.currentData = currentData[0].fields;
    }
    const previousData = JSON.parse(this.data.previousData)
    if (previousData && previousData.length > 0) {
      this.previousData = previousData[0].fields;
    }
  }

  getKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj).filter(key => key !== 'external_id'
      && key !== 'created_at'
      && key !== 'updated_at'
      && key !== 'version');
  }

  isEquals(key: string): boolean {
    if (this.currentData[key] === null || this.previousData[key] === null) {
      return false;
    }
    return this.currentData[key] === this.previousData[key];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

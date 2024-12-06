import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {QueryInfoDto} from "../dto/query";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-patient-query-log-detail',
  standalone: true,
  imports: [MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions, DatePipe,],
  templateUrl: './patient-query-log-detail.component.html',
  styleUrl: './patient-query-log-detail.component.scss'
})
export class PatientQueryLogDetailComponent {
  readonly dialogRef = inject(MatDialogRef<PatientQueryLogDetailComponent>);
  readonly data = inject<QueryInfoDto>(MAT_DIALOG_DATA);


  onNoClick(): void {
    this.dialogRef.close();
  }

}

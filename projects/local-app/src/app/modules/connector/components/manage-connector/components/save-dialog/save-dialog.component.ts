import {Component, Inject, OnInit} from '@angular/core';
import {ManageConnectorComponent} from "../../manage-connector.component";
import {MatSlideToggle, MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatDividerModule} from "@angular/material/divider";
import {NgForOf, NgIf} from "@angular/common";
import {MatSelectModule} from "@angular/material/select";
import {MatCell, MatTable, MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";

@Component({
  selector: 'app-save-dialog',
  standalone: true,
  imports: [MatFormFieldModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDividerModule,
    NgIf,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSlideToggle,
    NgForOf,
    MatCell,
    MatTable,
    MatTableModule,
    MatTooltipModule],
  templateUrl: './save-dialog.component.html',
  styleUrl: './save-dialog.component.scss'
})
export class ManageConnectorSaveDialogComponent implements OnInit {

  name: string = '';
  description: string = '';

  constructor(
    public dialogRef: MatDialogRef<ManageConnectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string, description: string },
  ) {
  }

  ngOnInit(): void {
    if (this.data) {
      if (this.data.name) {
        this.name = this.data.name;
      }

      if (this.data.description) {
        this.description = this.data.description;
      }
    }
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close({name: this.name, description: this.description});
  }

}

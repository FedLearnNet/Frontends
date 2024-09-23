import {Component, Inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from "@angular/material/dialog";
import {ConnectorStepSpecifySelectorsComponent} from "../../specify-selectors.component";
import {UploadInfoDialog} from "../../../../../../../dto/upload-info";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-change-name',
  templateUrl: './change-name.component.html',
  styleUrl: './change-name.component.scss',
  standalone: true,
  imports: [
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
    NgIf
  ],
})
export class ConnectorStepSpecifySelectorsChangeNameComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ConnectorStepSpecifySelectorsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadInfoDialog,
  ) {
  }

  newName: string = '';

  ngOnInit(): void {
    this.newName = this.data.renamedColumn;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    this.data.renamedColumn = this.newName;
    this.dialogRef.close(this.data);
  }

  onDeleteClick(): void {
    this.data.deleted = true;
    this.dialogRef.close(this.data);
  }

  onShowClick(): void {
    this.data.deleted = false;
    this.dialogRef.close(this.data);
  }
}

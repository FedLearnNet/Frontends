import { Component, OnInit, inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {ConnectorStepSpecifySelectorsComponent} from "../../specify-selectors.component";
import {UploadInfoDialog} from "../../../../../../../dto/upload-info";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-change-name',
  templateUrl: './change-name.component.html',
  styleUrl: './change-name.component.scss',
  imports: [
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDividerModule,
    TranslatePipe,
  ]
})
export class ConnectorStepSpecifySelectorsChangeNameComponent implements OnInit {
  dialogRef = inject<MatDialogRef<ConnectorStepSpecifySelectorsComponent>>(MatDialogRef);
  data = inject<UploadInfoDialog>(MAT_DIALOG_DATA);

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

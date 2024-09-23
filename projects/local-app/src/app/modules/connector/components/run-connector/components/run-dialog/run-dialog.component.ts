import {Component, Inject, OnInit} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatRadioModule} from "@angular/material/radio";
import {MatDividerModule} from "@angular/material/divider";
import {ConnectorConfig} from "../../../../models/connector-config";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {cloneDeep} from "lodash";
import {ConnectorRunService} from "../../../../services/run.service";

@Component({
  selector: 'app-run-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatRadioModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './run-dialog.component.html',
  styleUrl: './run-dialog.component.scss',
})
export class ConnectorRunDialogComponent implements OnInit {

  runMode: string = 'manual';
  dryRun: boolean = false;

  connector: ConnectorConfig;


  constructor(
    public dialogRef: MatDialogRef<ConnectorRunDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConnectorConfig,
    private connectorRunService: ConnectorRunService
  ) {
  }

  ngOnInit(): void {
    this.connector = cloneDeep(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onRunClick(): void {
    this.connectorRunService.runConnector(this.data.id!, this.runMode, this.dryRun).subscribe(() => {
      this.dialogRef.close();
    });
   // this.dialogRef.close();
  }
}

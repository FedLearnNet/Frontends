import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef,} from "@angular/material/dialog";
import {ConnectorConfig} from "../../../../models/connector-config";
import {cloneDeep} from "lodash";
import {ConnectorRunService} from "../../../../services/run.service";

@Component({
  selector: 'app-run-dialog',
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

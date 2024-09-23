import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { cloneDeep } from 'lodash';
import { LARGE, MEDIUM, SMALL, XLARGE, XSMALL } from '@shared-lib/constants';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { Schema } from '@shared-lib/models';

@Component({
  selector: 'app-schema-list',
  templateUrl: './schema-list.component.html',
  styleUrl: './schema-list.component.scss'
})
export class SchemaListComponent implements OnInit {
  cols: number = 3;
  rowHeight: string = '1:1';
  screenSize: string = LARGE;

  schemaList: Schema[];
  selectedSchemaId: string;

  constructor(
      public dialogRef: MatDialogRef<SchemaListComponent>,

      @Inject(MAT_DIALOG_DATA) public data: any,

      private responsiveService: ResponsiveService,
  ) { }

  ngOnInit(): void {
    this.schemaList = cloneDeep(this.data.schemaList);

    this.checkAndAdjustResponsiveLayout();
  }

  isSchemaSelected(schema: Schema): boolean {
    return this.selectedSchemaId === schema.uniqueId;
  }

  onChooseSchema(schema: Schema): void {
    this.selectedSchemaId = schema.uniqueId;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubscribe(): void {
    this.dialogRef.close(this.selectedSchemaId);
  }

  private checkAndAdjustResponsiveLayout(): void {
    this.responsiveService
        .getScreenSize()
        .subscribe(screenSize => {
          this.screenSize = screenSize;
          switch (screenSize) {
            case XLARGE:
              this.cols = 4;
              break;
            case LARGE:
              this.cols = 3;
              break;
            case MEDIUM:
            case SMALL:
              this.cols = 2;
              break;
            case XSMALL:
              this.cols = 1;
              break;
            default:
              this.cols = 2;
          }
        });
  }
}

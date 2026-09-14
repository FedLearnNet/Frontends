import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { TranslatePipe } from "@ngx-translate/core";
import { CommonModule } from '@angular/common';
import { getBaseColumnName } from '../../../../../../../helper/connector-config-helper';
import {SheetMergeResultDTO} from "../../../../../../../dto/connector";

export interface SheetMergeDialogData {
  sheets: { name: string; columns: string[] }[];
  isCsvZip?: boolean;
}


@Component({
  selector: 'app-merge-sheets',
  templateUrl: './merge-sheets.component.html',
  styleUrl: './merge-sheets.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatDividerModule,
    TranslatePipe,
  ]
})
export class MergeSheetsDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<MergeSheetsDialogComponent>>(MatDialogRef);
  data = inject<SheetMergeDialogData>(MAT_DIALOG_DATA);

  sheetUidMapping: Record<string, string> = {};
  commonUidColumnName: string = '';

  ngOnInit(): void {
    // Initialize with first column for each sheet, hopefully that's the UID
    this.data.sheets.forEach(sheet => {
      if (sheet.columns.length > 0) {
        this.sheetUidMapping[sheet.name] = getBaseColumnName(sheet.columns[0], sheet.name);
      }
    });

    // Initialize common UID column name with the first sheet's first column
    const firstSheet = this.data.sheets[0];
    if (this.data.sheets.length > 0 && firstSheet.columns.length > 0) {
      this.commonUidColumnName = getBaseColumnName(this.sheetUidMapping[firstSheet.name], firstSheet.name);
    }
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onMergeClick(): void {
    // Validate that all sheets have a UID selected
    const allSelected = this.data.sheets.every(sheet => !!this.sheetUidMapping[sheet.name]);

    if (!allSelected || !this.commonUidColumnName.trim()) {
      return;
    }

    // Find common UID column name (use the first sheet's selection as base)
    const firstSheetUid = this.sheetUidMapping[this.data.sheets[0].name];

    const result: SheetMergeResultDTO = {
      uidColumn: firstSheetUid,
      sheetUidMapping: this.sheetUidMapping,
      commonUidColumnName: this.commonUidColumnName.trim()
    };

    this.dialogRef.close(result);
  }

  isValid(): boolean {
    return this.data.sheets.every(sheet => !!this.sheetUidMapping[sheet.name]) && !!this.commonUidColumnName.trim();
  }

  protected readonly getBaseColumnName = getBaseColumnName;
}

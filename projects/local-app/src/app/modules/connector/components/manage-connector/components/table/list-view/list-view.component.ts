import { Component, inject } from '@angular/core';
import {MatListModule} from "@angular/material/list";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

import {TranslatePipe} from "@ngx-translate/core";


export interface ListViewComponentDialogData {
  list: string[];
  name: string;
}


@Component({
  selector: 'app-list-view',
  imports: [
    MatListModule,
    MatDialogTitle,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    TranslatePipe
],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss'
})
export class ListViewComponentDialogComponent {
  dialogRef = inject<MatDialogRef<ListViewComponentDialogComponent>>(MatDialogRef);
  data = inject<ListViewComponentDialogData>(MAT_DIALOG_DATA);
}


export function isArray(data: any) {
  if (Array.isArray(data)) {
    return true;
  }
  if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
    try {
      const isSingleQuoted = data.includes("'");
      const formattedString = isSingleQuoted ? data.replace(/'/g, '"') : data;

      const parsed = JSON.parse(formattedString);
      return !!Array.isArray(parsed)
    } catch (_e) {
      return false;
    }
  }
  return false;
}

export function getArrayOrString(data: any, index?: number) {
  if (Array.isArray(data)) {
    return index !== undefined ? data[index] : data;
  }
  if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
    try {
      const isSingleQuoted = data.includes("'");
      const formattedString = isSingleQuoted ? data.replace(/'/g, '"') : data;

      const parsed = JSON.parse(formattedString);
      if (Array.isArray(parsed)) {
        return index !== undefined ? parsed[index] : parsed;
      }
    } catch (_e) {
      return data;
    }
  }
  return data;
}


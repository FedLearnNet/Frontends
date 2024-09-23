import {Component, Inject} from '@angular/core';
import {MatListModule} from "@angular/material/list";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogModule,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {NgForOf} from "@angular/common";


export interface ListViewComponentDialogData {
  list: string[];
  name: string;
}


@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [MatListModule,
    MatDialogTitle,
    MatDialogModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule, NgForOf],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss'
})
export class ListViewComponentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ListViewComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ListViewComponentDialogData,
  ) {
  }
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
    } catch (e) {
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
    } catch (e) {
      return data;
    }
  }
  return data;
}


import { Component, inject, signal } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIcon } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckbox } from "@angular/material/checkbox";
import { AsyncPipe } from '@angular/common';


export interface TimeSeriesMappingDialogComponentResult {
  visitColumn?: string | null,
  visitTimestampColumn?: string | null,
  timestampFormat?: string | null,
  mapToAll?: boolean
}

export interface TimeSeriesMappingDialogComponentData extends TimeSeriesMappingDialogComponentResult {
  columns: string[],
  column: string
}


@Component({
  selector: 'app-time-series-mapping-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatIcon,
    MatButtonToggleModule,
    MatDivider,
    MatCheckbox,
    AsyncPipe
  ],
  templateUrl: './time-series-mapping-dialog.component.html',
  styleUrl: './time-series-mapping-dialog.component.scss'
})
export class TimeSeriesMappingDialogComponent {
  private readonly dialogRef: MatDialogRef<TimeSeriesMappingDialogComponent> = inject(MatDialogRef);
  readonly data = inject<TimeSeriesMappingDialogComponentData>(MAT_DIALOG_DATA);
  visitIdControl = new FormControl(this.data.visitColumn || '');
  timestampControl = new FormControl(this.data.visitTimestampColumn || '');
  timestampFormatControl = new FormControl(this.data.timestampFormat || '');
  filteredVisitIdOptions: Observable<string[]>;
  filteredTimestampOptions: Observable<string[]>;
  filteredTimestampFormatOptions: Observable<string[]>;

  mapToAll = signal<boolean>(false);

  private readonly sortedColumns = [...this.data.columns].sort((a, b) => a.localeCompare(b));

  constructor() {
    this.filteredVisitIdOptions = this.visitIdControl.valueChanges.pipe(
      startWith(this.data.visitColumn || ''),
      map(value => this._filter(value || '', this.sortedColumns)),
    );
    this.filteredTimestampOptions = this.timestampControl.valueChanges.pipe(
      startWith(this.data.visitTimestampColumn || ''),
      map(value => this._filter(value || '', this.sortedColumns)),
    );
    this.filteredTimestampFormatOptions = this.timestampFormatControl.valueChanges.pipe(
      startWith(this.data.timestampFormat || ''),
      map(value => this._filter(value || '', this.timestampFormats())),
    );
  }

  timestampFormats = signal<string[]>([
    "yyyy-MM-dd'T'HH:mm:ss'Z'",       // ISO 8601 UTC, e.g. 2025-08-28T12:34:56Z
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",   // ISO 8601 with milliseconds
    "yyyy-MM-dd'T'HH:mm:ssZZ",        // ISO 8601 with timezone offset, e.g. 2025-08-28T14:34:56+02:00
    "yyyy-MM-dd HH:mm:ss",            // SQL-style datetime
    "yyyy/MM/dd HH:mm:ss",            // Slash-separated datetime
    "dd.MM.yyyy HH:mm:ss",            // European format
    "MM/dd/yyyy HH:mm:ss",            // US format
    "yyyy-MM-dd",                     // ISO date only
    "dd.MM.yyyy",                     // European date only
    "MM/dd/yyyy",                     // US date only
    "HH:mm:ss",                       // Time only (24h)
    "hh:mm a",                        // Time only (12h with AM/PM)
    "EEE, dd MMM yyyy HH:mm:ss 'GMT'",// RFC 1123, e.g. Thu, 28 Aug 2025 14:34:56 GMT
    "yyyyMMdd'T'HHmmss'Z'",           // Compact ISO, e.g. 20250828T143456Z
    "epoch"                           // UNIX timestamp (seconds since 1970)
  ]);

  apply(): void {
    this.dialogRef.close({
      visitColumn: this.visitIdControl.value,
      visitTimestampColumn: this.timestampControl.value,
      timestampFormat: this.timestampFormatControl.value,
      mapToAll: this.mapToAll(),
    } as TimeSeriesMappingDialogComponentResult);
  }

  clear(): void {
    this.visitIdControl.setValue('');
    this.timestampControl.setValue('');
    this.dialogRef.close({ visitColumn: null, visitTimestampColumn: null } as TimeSeriesMappingDialogComponentResult);
  }

  isApplyEnabled(): boolean {
    if (this.timestampControl.value) {
      return !!(this.timestampFormatControl.value);
    }
    return !!(this.timestampControl.value || this.visitIdControl.value);
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }
}

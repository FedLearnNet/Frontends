import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {SchemaService} from "@local-app/cohort/services/schema.service";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatChipsModule} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatButtonModule} from "@angular/material/button";
import {DatePipe, NgClass} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {TranslatePipe} from "@ngx-translate/core";
import {SchemaNodeDto, SchemaNodeNestedDto} from "@local-app/cohort/dto/schema";
import {DataTypeDto, DataTypeTypeEnum} from "@local-app/cohort/dto/data-type";

@Component({
  selector: 'app-patient-data-group-detail-info-dialog',
  imports: [
    MatDialogModule,
    MatIcon,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    NgClass,
    MatProgressSpinner,
    ErrorCardComponent,
    DatePipe,
    CloseableDialogTitleComponent,
    TranslatePipe
  ],
  templateUrl: './patient-data-group-detail-info-dialog.component.html',
  styleUrl: './patient-data-group-detail-info-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDataGroupDetailInfoDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<PatientDataGroupDetailInfoDialogComponent>);
  private readonly data = inject<SchemaNodeNestedDto>(MAT_DIALOG_DATA);
  private readonly schemaService: SchemaService = inject(SchemaService);

  loading = signal<boolean>(true);
  error = signal<string | undefined>(undefined);
  schema = signal<SchemaNodeDto | undefined>(undefined)

  ngOnInit(): void {
    this.schemaService.getSchemaDetail(this.data.id).subscribe((schema: SchemaNodeDto) => {
      this.loading.set(false);
      this.schema.set(schema);
    })
  }

  close(): void {
    this.dialogRef.close();
  }

  objectKeys = (o?: Record<string, string>) => (o ? Object.keys(o) : []);

  dataTypeLabel(dt?: DataTypeDto): string {
    if (!dt) return '-';
    const t = dt.type;
    switch (t) {
      case DataTypeTypeEnum.INT:
        return 'Integer';
      case DataTypeTypeEnum.FLOAT:
        return 'Float';
      case DataTypeTypeEnum.BOOLEAN:
        return 'Boolean';
      case DataTypeTypeEnum.STRING:
        return 'Text';
      case DataTypeTypeEnum.FILE:
        return 'File';
      case DataTypeTypeEnum.DATE:
        return 'Date';
      case DataTypeTypeEnum.DATE_TIME:
        return 'Date/Time';
      case DataTypeTypeEnum.CATEGORICAL:
        return 'Category';
      default:
        return String(t);
    }
  }


  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}

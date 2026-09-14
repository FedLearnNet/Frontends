import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {PatientDataTraceabilityDetailLogDto, PatientDataTraceabilityLogDto} from "../../dto/logs";
import {TranslatePipe} from "@ngx-translate/core";
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {LogService} from "../../services/log-service";
import {MatTableModule} from "@angular/material/table";
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';
import {MatIcon} from '@angular/material/icon';
import {
  PatientRollbackDialogComponent,
  PatientRollbackDialogData
} from '../../../patient/components/patient-rollback-dialog/patient-rollback-dialog.component';

@Component({
  selector: 'app-patient-update-log-detail',
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatTableModule,
    TranslatePipe,
    CloseableDialogTitleComponent,
    KvComponent,
    BadgeComponent,
    TimeBadgeComponent,
    MatIcon,
  ],
  templateUrl: './patient-update-log-detail.component.html',
  styleUrl: './patient-update-log-detail.component.scss'
})
export class PatientUpdateLogDetailComponent implements OnInit {
  private readonly service: LogService = inject(LogService);
  private readonly dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<PatientUpdateLogDetailComponent>);
  readonly data = inject<PatientDataTraceabilityLogDto>(MAT_DIALOG_DATA);

  log = signal<PatientDataTraceabilityDetailLogDto>(this.data as PatientDataTraceabilityDetailLogDto);

  displayedColumns: string[] = ['changeType', 'propertyName', 'previousData', 'currentData'];

  readonly sortedLog = computed(() => (this.log()?.changes ?? []).sort(
    (a,b) => a.schemaNodeId - b.schemaNodeId))

  ngOnInit() {
    this.service.getPatientDataTraceabilityLogDetail(this.data.internalPatientId, this.data.revId).subscribe(
      data => this.log.set(data)
    )
  }


  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }

  openPatientRollbackDialog(): void {
    const log = this.log();
    this.dialog.open(PatientRollbackDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      autoFocus: false,
      data: {
        mode: 'PATIENT_REVISION',
        cohortId: log.cohortId,
        internalPatientId: log.internalPatientId,
        patientId: log.patientId,
        revisionNumber: log.revId,
        createdAt: log.createdAt,
      } as PatientRollbackDialogData
    });
  }
}

import {Component, inject, signal} from '@angular/core';
import {PatientService} from "../../service/patient.service";
import {ConnectorService} from "../../../connector/services/connector-crud.service";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatIcon} from '@angular/material/icon';
import {CloseableDialogTitleComponent} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {TimeBadgeComponent} from '@shared-lib/components/time-badge/time-badge.component';

type RollbackMode = 'CONNECTOR_RUN' | 'PATIENT_REVISION';

export interface PatientRollbackDialogData {
  mode: RollbackMode;
  connectorId?: number;
  connectorName?: string;
  runId?: number;
  cohortId?: number;
  internalPatientId?: number;
  patientId?: string;
  revisionNumber?: number;
  createdAt?: Date;
}

@Component({
  selector: 'app-patient-rollback-dialog',
  imports: [
    CloseableDialogTitleComponent,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatCheckbox,
    MatIcon,
    KvComponent,
    BadgeComponent,
    TimeBadgeComponent,
  ],
  templateUrl: './patient-rollback-dialog.component.html',
  styleUrl: './patient-rollback-dialog.component.scss',
})
export class PatientRollbackDialogComponent {
  readonly data = inject<PatientRollbackDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PatientRollbackDialogComponent>);
  private readonly patientService: PatientService = inject(PatientService);
  private readonly connectorService: ConnectorService = inject(ConnectorService);

  deleteAudit = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | undefined>(undefined);

  get title(): string {
    return this.data.mode === 'CONNECTOR_RUN' ? 'Rollback connector run' : 'Rollback patient revision';
  }

  get confirmLabel(): string {
    return this.data.mode === 'CONNECTOR_RUN' ? 'Rollback run' : 'Rollback patient';
  }

  get canRollback(): boolean {
    if (this.data.mode === 'CONNECTOR_RUN') {
      return this.data.connectorId != null && this.data.runId != null;
    }

    return this.data.cohortId != null
      && this.data.internalPatientId != null
      && this.data.revisionNumber != null;
  }

  rollback(): void {
    if (!this.canRollback || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(undefined);

    const request = this.data.mode === 'CONNECTOR_RUN'
      ? this.connectorService.rollbackConnectorRun(this.data.connectorId!, this.data.runId!, this.deleteAudit())
      : this.patientService.rollbackPatientData(
        this.data.cohortId!,
        this.data.internalPatientId!,
        this.data.revisionNumber!,
        this.deleteAudit()
      );

    request.subscribe({
      next: (result) => {
        this.isSubmitting.set(false);
        this.dialogRef.close(result ?? true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Rollback failed. Please review the selected target and try again.');
      }
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}

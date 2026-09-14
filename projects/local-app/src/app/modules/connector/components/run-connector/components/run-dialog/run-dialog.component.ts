import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import { ConnectorDTO, ConnectorInputConfigDTO } from "../../../../dto/connector";
import {ConnectorRunService} from "../../../../services/run.service";
import {MatDivider} from '@angular/material/divider';
import {FormsModule} from '@angular/forms';
import {MatCheckbox} from '@angular/material/checkbox';
import {RunNewFileComponent} from '../run-new-file/run-new-file.component';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {setMissingFileInfo} from '@shared-lib/utils';
import {take} from 'rxjs';
import {ConnectorUploadService} from '../../../../services/connector-upload.service';
import {FileParsingSettingsDTO} from '../../../../dto/upload-info';
import {CohortDetailDto} from '@local-app/cohort/models';
import {MatCardModule} from '@angular/material/card';
import {Router} from '@angular/router';
import {MAPPING_PREVIEW_FRAGMENT} from '../../../../constansts/mapping.constants';
import {UNIQUE_PATIENT_ID_NODE} from '@local-app/utils/constants/unique-patient-id-node';
import {connectorFilesDetailToFileInfo, isFileUploadSettings} from "../../../../helper/connector-config-helper";
import {ConnectorMappingConfig} from "../../../../models/connector-model";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-run-dialog',
  templateUrl: './run-dialog.component.html',
  styleUrl: './run-dialog.component.scss',
  imports: [
    MatDialogTitle,
    MatDivider,
    MatDialogContent,
    FormsModule,
    MatCheckbox,
    RunNewFileComponent,
    MatDialogActions,
    MatButton,
    TranslatePipe,
    MatCardModule,
    BtnComponent,
  ]
})
export class ConnectorRunDialogComponent implements OnInit {
  dryRun = signal<boolean>(false);
  deleteExistingPatients = signal<boolean>(false);
  uploadInProgress = signal<boolean>(false);
  runInProgress = signal<boolean>(false);
  connector = signal<ConnectorDTO>({} as ConnectorDTO);
  cohort = signal<CohortDetailDto>({} as CohortDetailDto);

  private readonly router = inject(Router);
  private readonly uploadService = inject(ConnectorUploadService);
  private readonly connectorRunService = inject(ConnectorRunService);

  public readonly dialogRef = inject(MatDialogRef<ConnectorRunDialogComponent, boolean>);
  public readonly data = inject<{ cohort: CohortDetailDto; connector: ConnectorDTO }>(MAT_DIALOG_DATA);

  readonly unmappedRequiredFields = computed(() =>
    this.connectorRunService.findUnmappedRequiredFields(
      this.cohort()?.schemaRoot,
      this.connector()?.schemaMapping as ConnectorMappingConfig[] | undefined
    )
  );

  readonly hasUnmappedRequiredFields = computed(
    () => this.unmappedRequiredFields().length > 0
  );

  fileExist = signal<boolean>(false);
  fileSettings = signal<FileParsingSettingsDTO | undefined>(undefined);
  readonly valid = computed(() => {
    if (this.hasUnmappedRequiredFields() || this.uploadInProgress()) {
      return false;
    }
    return this.fileExist();
  }
  );

  ngOnInit(): void {
    this.connector.set(this.data.connector);

    const cohort = this.data.cohort;
    const existingChildren = cohort.schemaRoot.childNodes ?? [];

    const hasUniquePatientNode = existingChildren.some(
      node => node.globalId === UNIQUE_PATIENT_ID_NODE.globalId
    );

    this.cohort.set({
      ...cohort,
      schemaRoot: {
        ...cohort.schemaRoot,
        childNodes: hasUniquePatientNode
          ? existingChildren
          : [...existingChildren, UNIQUE_PATIENT_ID_NODE]
      }
    });

    const inputConfig = this.connector().inputConfig;
    if (inputConfig && isFileUploadSettings(inputConfig)) {
      this.fileExist.set(false);
      this.loadFileDetail();
    } else {
      this.fileExist.set(true);
    }
  }

  onDeleteExistingChanged(checked: boolean) {
    this.deleteExistingPatients.set(checked);

    if (checked) {
      this.dryRun.set(false);
    }
  }

  onDryRunChanged(checked: boolean) {
    this.dryRun.set(checked);

    if (checked) {
      this.deleteExistingPatients.set(false);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onRunClick(): void {
    if (!this.valid() || this.runInProgress()) {
      return;
    }
    this.runInProgress.set(true);
    this.connectorRunService.runConnector(this.connector().id!, this.deleteExistingPatients(), this.dryRun())
      .subscribe({
        next: () => {
          this.dialogRef.close(true)
        },
        error: (err) => {
          this.runInProgress.set(false);
          console.error(err);
        },
      });
  }

  goToMapping(): void {
    this.dialogRef.close();

    this.router.navigate(
      ['cohort', this.cohort().id, 'connector', 'edit', this.connector().id],
      { fragment: MAPPING_PREVIEW_FRAGMENT }
    );
  }

  handleUploadSuccess(fileId: number): void {
    if (!fileId) {
      return;
    }

    this.fileExist.set(true);

    this.connector.set({
      ...this.connector(),
      inputConfig: {
        ...this.connector().inputConfig,
        fileId: fileId,
        fileExists: true,
      } as ConnectorInputConfigDTO,
    });
  }

  handleUploadState(uploading: boolean): void {
    this.uploadInProgress.set(uploading);
    if (uploading) {
      // Once replacement starts, only the completed HTTP response makes the
      // selected file runnable; 100% merely means all bytes reached the server.
      this.fileExist.set(false);
    }
  }


  private loadFileDetail(): void {
    const inputConfig = this.connector().inputConfig;
    if (!inputConfig || !isFileUploadSettings(inputConfig)) {
      return;
    }
    const fileId = inputConfig.fileId;

    if (!fileId) {
      this.connector.set(setMissingFileInfo(this.connector()));
      return;
    }

    const wasReportedPresent = inputConfig.fileExists === true;
    this.uploadService
      .getFileDetail(this.connector().cohortId!, fileId)
      .pipe(take(1))
      .subscribe({
        next: (fileInfoDetail) => {
          this.fileSettings.set(fileInfoDetail.uploadSettings);
          if (!wasReportedPresent) {
            return;
          }
          const fileInfo = connectorFilesDetailToFileInfo(fileInfoDetail);
          if (fileInfo) {
            this.connector().fileInfo = {
              ...this.connector().fileInfo,
              ...fileInfo,
            };
            this.fileExist.set(true);
          } else {
            this.connector.set(
              setMissingFileInfo(this.connector())
            );
          }
        },
        error: (_err: any) => {
          if (wasReportedPresent) {
            this.connector.set(
              setMissingFileInfo(this.connector())
            );
          }
        }
      });
  }
}

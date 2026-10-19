import {Component, computed, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  CloseableDialogTitleComponent
} from "@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {
  PipelinePublishInfoDetailComponent
} from "../pipeline-publish-info-detail/pipeline-publish-info-detail.component";
import {AppPublishInfoDTO} from "@shared-lib/modules/store/dto/publish-info";
import {AuthorDto} from "@shared-lib/modules/store/dto/app-author";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {catchError, EMPTY, finalize} from "rxjs";
import {PipelineService} from "../../service/pipeline.service";
import {PipelineRunMode, PipelineType} from "../../dto/pipeline";
import {PipelineDetailDialogComponent} from "../pipeline-detail-dialog/pipeline-detail-dialog.component";

interface PipelinePublishInfoDialogData {
  publishInfo: AppPublishInfoDTO;
  appVersionId: number;
  authors?: AuthorDto[];
}

@Component({
  selector: 'app-pipeline-publish-info-dialog',
  imports: [
    CloseableDialogTitleComponent,
    PipelinePublishInfoDetailComponent,
    MatButton,
    MatIcon,
    MatTooltip
  ],
  templateUrl: './pipeline-publish-info-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './pipeline-publish-info-dialog.component.scss',
})
export class PipelinePublishInfoDialogComponent {
  private readonly dialogRef: MatDialogRef<PipelinePublishInfoDialogComponent> = inject(MatDialogRef);
  private readonly dialog = inject(MatDialog);
  private readonly pipelineService = inject(PipelineService);
  private readonly authState = inject(AuthStateService);
  readonly data = inject<PipelinePublishInfoDialogData>(MAT_DIALOG_DATA);
  readonly rescanning = signal(false);
  readonly isToolOwner = computed(() => {
    const username = this.authState.userProfile()?.username;
    return this.authState.isLoggedIn() && !!username
      && !!this.data.authors?.some(author => author.keycloakId === username);
  });

  rescanVulnerabilities(): void {
    if (!this.isToolOwner() || !this.data.publishInfo.imageName || this.rescanning()) {
      return;
    }
    this.rescanning.set(true);
    this.pipelineService.create({
      pipelineType: PipelineType.APP,
      runMode: PipelineRunMode.SCAN_ONLY,
      appVersionId: this.data.appVersionId,
      autoStart: true,
    }).pipe(
      catchError(() => EMPTY),
      finalize(() => this.rescanning.set(false)),
    ).subscribe(pipeline => {
      this.dialogRef.close();
      this.dialog.open(PipelineDetailDialogComponent, {
        data: pipeline,
        height: '80vh',
        width: '90vw',
        maxWidth: '90vw',
        autoFocus: false,
      });
    });
  }

  toggleMaximize(isMaximized: boolean): void {
    if (isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
    } else {
      this.dialogRef.updateSize('90vw', '80vh');
    }
  }
}

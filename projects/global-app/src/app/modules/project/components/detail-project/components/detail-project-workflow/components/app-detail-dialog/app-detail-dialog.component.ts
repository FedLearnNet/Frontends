import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {AppDetailDto} from "@global-app/app-store/dto/app-detail";
import {WorkflowElementDto} from "@global-app/project/dto/workflow";
import {cloneDeep} from "lodash";
import {AppVersionDto} from "@global-app/app-store/dto/app-version";
import {AppVersionListComponent} from "@global-app/app-store/components/app-version-list/app-version-list.component";
import {AppHeaderComponent} from "@global-app/app-store/components/app-header/app-header.component";
import {AppConfigComponent} from "@global-app/app-store/components/app-config/app-config.component";
import {MarkdownComponent} from "ngx-markdown";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {
  AppRunHyperparameterComponent
} from "../../../../../../../test-app/components/app-runs/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {AppDto} from "@global-app/app-store/dto/app";
import {AppService} from "@global-app/app-store/service/app.service";

interface DialogData {
  app: AppDto;
  step: WorkflowElementDto;
}

@Component({
  selector: 'app-app-detail-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, AppVersionListComponent, AppHeaderComponent, AppConfigComponent, MarkdownComponent, MatTab, MatTabGroup, AppRunHyperparameterComponent],
  templateUrl: './app-detail-dialog.component.html',
  styleUrl: './app-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDetailDialogComponent implements OnInit {
  private readonly appService: AppService = inject(AppService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  readonly dialogRef = inject(MatDialogRef<AppDetailDialogComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  workflowElement: WorkflowElementDto;
  selectedVersion: AppVersionDto;
  app: AppDetailDto;

  hyperParamsValid: boolean = false;

  ngOnInit() {
    this.workflowElement = cloneDeep(this.data.step);

    this.appService.getApp(this.workflowElement.federatedAppId).subscribe(app => {
      this.app = app;
      const usedVersion = this.app.versions.find(version => version.id === this.workflowElement.federatedAppVersionId);
      if (usedVersion) {
        this.selectedVersion = usedVersion
      } else {
        this.selectedVersion = this.app.versions.find(version => version.id === this.data.app.latestVersionId)!;
      }
      this.versionChanged(this.selectedVersion);
    });

  }

  doesAppHaveValidHyperParamsConfig(): boolean {
    const appHasHyperParam = this.selectedVersion &&
      this.selectedVersion.appConfig &&
      this.selectedVersion.appConfig.hyperparams.length > 0;

    if(!appHasHyperParam) {
      return true;
    }
    return this.hyperParamsValid
  }

  versionChanged(version: AppVersionDto): void {
    if (!this.app) {
      return;
    }
    this.selectedVersion = version;
    this.workflowElement.federatedAppVersionId = version.id;
    this.app.appConfig = version.appConfig;
    this.app.shortDescription = version.shortDescription;
    this.app.longDescription = version.longDescription;
    this.app.imageName = version.imageName;
    this.app.latestVersion = version.appVersion;
    this.app.latestVersionId = version.id;
    this.app.certificationLevel = version.certificationLevel;
    if (version.imageName) {
      this.app.hasImage = true;
    }
    this.cdr.detectChanges();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onRemoveClick(): void {
    this.dialogRef.close(false);
  }

  onHyperParamsChanged(hyperParams: { [key: string]: any }) {
    this.workflowElement.hyperParams = hyperParams;
  }

  onOkClick(): void {
    this.dialogRef.close(this.workflowElement);
  }
}

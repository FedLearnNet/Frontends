import {Component, computed, inject, signal} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  AppRunHyperparameterComponent
} from "@shared-lib/modules/app-execution/components/app-run-hyperparameter/app-run-hyperparameter.component";
import {MatButton} from "@angular/material/button";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {
  StoreAppConfigComponent
} from "@shared-lib/modules/store/components/store-app-config/store-app-config.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {
  StoreVersionListComponent
} from "@shared-lib/modules/store/components/store-version-list/store-version-list.component";
import {TranslatePipe} from "@ngx-translate/core";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {ModelDetailDto, ModelVersionDto} from "@shared-lib/modules/app-execution/dto/model";
import {ToolHyperParamConfigDTO, ToolConfigHyperParamDataType} from "@shared-lib/modules/app-execution/dto/config";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";

@Component({
  selector: 'lib-workflow-node-detail-dialog',
  imports: [
    AppRunHyperparameterComponent,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatTab,
    MatTabGroup,
    StoreAppConfigComponent,
    StoreCardComponent,
    StoreVersionListComponent,
    TranslatePipe
  ],
  templateUrl: './workflow-node-detail-dialog.component.html',
  styleUrl: './workflow-node-detail-dialog.component.scss'
})
export class WorkflowNodeDetailDialogComponent {
  readonly dialogRef = inject(MatDialogRef<WorkflowNodeDetailDialogComponent>);
  readonly data = inject<WorkflowNodeDetailDTO>(MAT_DIALOG_DATA);

  node = signal<WorkflowNodeDetailDTO>(this.data);
  selectedVersion = computed(() => {
    const federatedAppVersionId = this.node().federatedAppVersionId;
    const app = this.app();
    if (!app) {
      return;
    }
    if (federatedAppVersionId) {
      const usedVersion = app.versions.find(version => version.id === federatedAppVersionId);
      if (usedVersion) {
        return usedVersion;
      }
    }
    return app.versions.find(version => version.id === app.latestVersionId)!;
  });
  app = computed(() => this.node().appDetail);
  hyperParams = computed(() => this.selectedVersion()?.appConfig?.hyperparams ?? []);

  hyperParamsValid = signal<boolean>(false);

  storeElement = computed(() => {
    return {
      app: this.app(),
      model: undefined
    }
  });

  doesAppHaveValidHyperParamsConfig = computed(() => {
    const appHasHyperParam = this.hyperParams().length > 0;
    if (!appHasHyperParam) {
      return true;
    }
    return this.hyperParamsValid();
  });

  versionChanged(version: AppVersionDto | ModelVersionDto): void {
    if (!this.app()) {
      return;
    }
    this.node.update(u => {
      u.federatedAppVersionId = version.id;
      return u;
    })
  }


  onHyperParamsChanged(hyperParams: { [key: string]: any }) {
    for (const key in hyperParams) {
      const param = this.getHyperParamConfig(key);
      if (param) {
        if (param.type == ToolConfigHyperParamDataType.FLOAT || param.type == ToolConfigHyperParamDataType.INTEGER) {
          hyperParams[key] = Number(hyperParams[key]);
        }
      }
    }
    this.node.update(n => {
      n.hyperParams = hyperParams;
      return n;
    });
  }

  getHyperParamConfig(name: string): ToolHyperParamConfigDTO | undefined {
    return this.hyperParams().find(h => {
      const n = h.variableName ? h.variableName : h.name;
      return n === name;
    });
  }

  updateAppDetail(app: AppDetailDto | ModelDetailDto | undefined){
    if(!app) return;
    this.node.update(n => {
      n.appDetail = app as AppDetailDto;
      return n;
    });
  }
  onOkClick(): void {
    this.dialogRef.close(this.node());
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onRemoveClick(): void {
    this.dialogRef.close(false);
  }
}

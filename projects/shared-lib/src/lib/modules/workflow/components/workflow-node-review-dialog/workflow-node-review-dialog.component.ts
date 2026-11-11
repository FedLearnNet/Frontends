import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {TranslatePipe} from "@ngx-translate/core";
import {WorkflowNodeDetailDTO} from "@shared-lib/modules/workflow/dto/workflow.dto";
import {
  RunHyperParamsComponent
} from "@shared-lib/modules/experiments/components/run-hyper-params/run-hyper-params.component";
import {StoreCardComponent} from "@shared-lib/modules/store/components/store-card/store-card.component";
import {InfoService} from "@local-app/utils/services/info.service";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'lib-workflow-node-review-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    TranslatePipe,
    RunHyperParamsComponent,
    StoreCardComponent,
    MatIcon
  ],
  templateUrl: './workflow-node-review-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './workflow-node-review-dialog.component.scss'
})
export class WorkflowNodeReviewDialogComponent {
  readonly dialogRef = inject(MatDialogRef<WorkflowNodeReviewDialogComponent>);
  readonly data = inject<WorkflowNodeDetailDTO>(MAT_DIALOG_DATA);
  private readonly infoService = inject(InfoService);

  hyperParams = this.data.hyperParams ?? {};
  storeElement = {
    app: this.data.appDetail,
    model: this.data.modelDetail
  }

  get storeUrl() {
    let globalUrl = this.infoService.info()?.globalWebUrl;
    if (!globalUrl) {
      return undefined;
    }
    if (!globalUrl.endsWith("/")) {
      globalUrl += "/";
    }
    globalUrl += "store/";
    if (this.data.modelDetail) {
      globalUrl += "model/" + this.data.modelDetail.id;
    } else if (this.data.appDetail) {
      globalUrl += '' + this.data.appDetail.id;
    } else {
      return undefined;
    }
    return globalUrl;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

import {Component, inject, input, output} from '@angular/core';
import {FExternalItemDirective} from "@foblex/flow";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDialog} from "@angular/material/dialog";
import {
  StoreSelectDialogComponent
} from "@shared-lib/modules/store/components/store-select-dialog/store-select-dialog.component";
import {StoreSelectDialogResult} from "@shared-lib/modules/store/components/model/model-select-dialog";
import {
  WorkflowChatDialogComponent
} from "@shared-lib/modules/workflow/components/workflow-chat-dialog/workflow-chat-dialog.component";
import {ActivatedRoute} from "@angular/router";
import {
  WorkflowPublishDialogComponent
} from "@shared-lib/modules/workflow/components/workflow-publish-dialog/workflow-publish-dialog.component";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";
import {Location} from '@angular/common';
import {MatTooltip} from "@angular/material/tooltip";
import {StoreSelectDialogData} from "@shared-lib/modules/store/model/store-select-dialog";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {environment} from "@global-app/env/environment";
import {WorkflowService} from "@shared-lib/modules/workflow/store/workflow.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'lib-workflow-palette',
  imports: [
    FExternalItemDirective,
    MatIcon,
    MatIconButton,
    MatTooltip,

  ],
  templateUrl: './workflow-palette.component.html',
  styleUrl: './workflow-palette.component.scss'
})
export class WorkflowPaletteComponent {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly location: Location = inject(Location);
  private readonly service: WorkflowService = inject(WorkflowService);
  private readonly translate: TranslateService = inject(TranslateService);

  readonly isProduction = environment.production;

  showBackBtn = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(p => !!p.get('workflow-id'))
    ),
    {initialValue: false}
  );

  workflowId = input<number | undefined>();
  isValid = input<boolean>(true);
  isForFederatedLearning = input<boolean>(false);
  nodeAdded = output<StoreSelectDialogResult>();
  datasetAdded = output<boolean>();

  openShopDialog(): void {
    this.dialog.open(StoreSelectDialogComponent,
      {
        width: '980px',
        height: '100%',
        position: {
          top: '0',
          right: '0',
        },
        data: {
          storeConfig: {
            hideWorkflow: true,
          }
        } as StoreSelectDialogData,
      }).afterClosed().subscribe((result?: StoreSelectDialogResult) => {
      if (result) {
        this.nodeAdded.emit(result);
      }
    });
  }

  addDataset(): void {
    this.datasetAdded.emit(true);
  }


  routeBack() {
    this.location.back();
  }

  public openChat(): void {
    this.dialog.open(WorkflowChatDialogComponent, {
      width: '980px',
      height: '100%',
      position: {top: '0', right: '0'},
      autoFocus: false,
      data: this.workflowId()
    });
  }

  public openPublishDialog(): void {
    this.dialog.open(WorkflowPublishDialogComponent);
  }

  protected saveWorkflowAsJson() {
    if (this.workflowId()) {
      this.service.exportWorkflowAsJson(this.workflowId()!).subscribe((path) => {
          if (!path) {
            path = "Error";
          }
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: this.translate.instant('DIALOG.EXPORT_TOOL.TITLE'),
              message: this.translate.instant('DIALOG.EXPORT_TOOL.MESSAGE') + path,
              confirmButtonText: this.translate.instant('DIALOG.OK'),
            },
          });
        }
      )
    }
  }
}

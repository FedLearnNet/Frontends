import {ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {selectAllPipelines, selectLoading} from "../../service/pipeline.selectors";
import {toSignal} from "@angular/core/rxjs-interop";
import {createPipeline, loadPipelines} from "../../service/pipeline.actions";
import {PipelineCreateDTO, PipelineDTO, PipelineStatus, PipelineType} from "../../dto/pipeline";
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {Store} from "@ngrx/store";
import {MatChipsModule} from "@angular/material/chips";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {FormsModule} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {PipelineDetailDialogComponent} from "../pipeline-detail-dialog/pipeline-detail-dialog.component";
import {ConfirmDialogComponent} from "@shared-lib/components/confirm-dialog/confirm-dialog.component";
import {TranslateService} from "@ngx-translate/core";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {SseRefreshBtnComponent} from "@shared-lib/components/sse-refresh-btn/sse-refresh-btn.component";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'app-pipeline-list',
  imports: [MatButtonModule,
    MatChipsModule, MatFormFieldModule,
    MatInputModule, MatMenuModule, MatDialogModule, FormsModule, DatePipe, StatusBadgeComponent, SseRefreshBtnComponent, BtnComponent],
  templateUrl: './pipeline-list.component.html',
  styleUrl: './pipeline-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineListComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly translate: TranslateService = inject(TranslateService);

  modelSubId = input<number | undefined>();
  appVersionId = input<number | undefined>();
  appId = input<number | undefined>();

  readonly pipelines = toSignal(this.store.select(selectAllPipelines));
  readonly loading = toSignal(this.store.select(selectLoading));

  statusFilter = signal<'ALL' | PipelineStatus>('ALL');
  typeFilter = signal<'ALL' | PipelineType>('ALL');

  filtered = computed(() => {
    if (!this.pipelines() || this.pipelines()?.length === 0) {
      return [];
    }
    const status = this.statusFilter();
    const type = this.typeFilter();
    return this.pipelines()!.filter(p =>
      (status === 'ALL' || p.pipelineStatus === status) &&
      (type === 'ALL' || p.pipelineType === type)
    );
  })

  showFilter = computed(() => {
    return !(!!this.modelSubId() || !!this.appVersionId() || !!this.appId());
  });

  canCreate = computed(() => {
    return (!!this.modelSubId() || !!this.appVersionId());
  })

  ngOnInit() {
    if (this.appId() && this.appVersionId()) {
      this.store.dispatch(loadPipelines({
        modelSubId: this.modelSubId(),
        appId: this.appId()
      }));
    } else {
      this.store.dispatch(loadPipelines({
        modelSubId: this.modelSubId(),
        appVersionId: this.appVersionId(),
        appId: this.appId()
      }));
    }
  }

  public create() {
    if (!this.canCreate()) {
      return;
    }
    if (this.modelSubId() && this.appVersionId()) {
      console.warn("Both are set, cannot decide on which foundation a pipeline should be created");
    }
    const pipelineType = this.modelSubId() ? PipelineType.MODEL : PipelineType.APP;
    const toCreate: PipelineCreateDTO = {
      pipelineType: pipelineType,
      modelSubId: this.modelSubId(),
      appVersionId: this.appVersionId(),
      autoStart: true
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('DIALOG.CREATE_PIPELINE.TITLE'),
        message: this.translate.instant('DIALOG.CREATE_PIPELINE.MESSAGE'),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.CREATE'),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.store.dispatch(createPipeline({request: toCreate}));
    });
  }

  openDetail(p: PipelineDTO) {
    this.dialog.open(PipelineDetailDialogComponent, {
      height: '80vh',
      width: '90vw',
      maxWidth: '90vw',
      autoFocus: false,
      data: p,
    });
  }

  protected readonly PipelineStatus = PipelineStatus;
  protected readonly PipelineType = PipelineType;
  protected readonly pipelineStatusToBadgeStatus = pipelineStatusToBadgeStatus;
}


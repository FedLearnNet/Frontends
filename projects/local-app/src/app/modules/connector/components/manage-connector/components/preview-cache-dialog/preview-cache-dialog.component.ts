import {Component, computed, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {DatePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {CloseableDialogTitleComponent} from '@shared-lib/components/closeable-dialog-title/closeable-dialog-title.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {HintCardComponent} from '@shared-lib/components/hint-card/hint-card.component';
import {PreviewStageDTO} from '../../../../dto/preview';

export interface PreviewCacheDialogData {
  stage: PreviewStageDTO;
  stepTitle: string;
  followingSteps: number;
}

export interface PreviewCacheDialogResult {
  invalidated: boolean;
  fromStep: number;
}

@Component({
  selector: 'app-preview-cache-dialog',
  imports: [
    MatDialogActions,
    MatDialogContent,
    DatePipe,
    TranslatePipe,
    CloseableDialogTitleComponent,
    BtnComponent,
    KvComponent,
    BadgeComponent,
    HintCardComponent,
  ],
  templateUrl: './preview-cache-dialog.component.html',
  styleUrl: './preview-cache-dialog.component.scss',
})
export class PreviewCacheDialogComponent {
  private readonly dialogRef =
    inject(MatDialogRef<PreviewCacheDialogComponent, PreviewCacheDialogResult>);
  readonly data = inject<PreviewCacheDialogData>(MAT_DIALOG_DATA);

  readonly invalidating = signal(false);

  readonly stage = computed(() => this.data.stage);
  readonly isCached = computed(() => !!this.data.stage?.cached);

  readonly notRun = computed(() => !!this.data.stage?.requiresRun);

  readonly explanationKey = computed(() => {
    if (this.notRun()) {
      return 'PREVIEW_CACHE.EXPLAIN_NOT_RUN';
    }
    return this.isCached() ? 'PREVIEW_CACHE.EXPLAIN_CACHED' : 'PREVIEW_CACHE.EXPLAIN_FRESH';
  });

  readonly shortFingerprint = computed(() => {
    const fingerprint = this.data.stage?.fingerprint;
    return fingerprint ? fingerprint.substring(0, 12) : '—';
  });

  invalidate(): void {
    this.invalidating.set(true);
    this.dialogRef.close({invalidated: true, fromStep: this.data.stage.stepIndex});
  }

  close(): void {
    this.dialogRef.close({invalidated: false, fromStep: this.data.stage.stepIndex});
  }
}

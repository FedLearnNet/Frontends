import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, model, signal} from '@angular/core';
import {AppPublishInfoDTO, MalwareFindingDTO} from "@shared-lib/modules/store/dto/publish-info";
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTableModule} from "@angular/material/table";
import {MatDivider} from "@angular/material/list";
import {MatTooltip} from "@angular/material/tooltip";
import {MatButton} from "@angular/material/button";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {StatusBadgeComponent} from "@shared-lib/components/status-badge/status-badge.component";
import {pipelineStatusToBadgeStatus} from "@shared-lib/utils/badge-status.helper";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {AuthorDto} from "@shared-lib/modules/store/dto/app-author";
import {PipelineService} from "../../service/pipeline.service";
import {PipelineRunMode, PipelineStatus, PipelineType} from "../../dto/pipeline";
import {finalize, startWith, switchMap, takeWhile} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {JsonPipe} from '@angular/common';

@Component({
  selector: 'app-pipeline-publish-info-detail',
  imports: [MatCardModule,
    MatIconModule,
    MatTableModule,
    MatExpansionModule,
    MatDivider,
    MatTooltip,
    MatButton,
    BadgeComponent,
    StatusBadgeComponent,
    KvComponent,
    JsonPipe],
  templateUrl: './pipeline-publish-info-detail.component.html',
  styleUrl: './pipeline-publish-info-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelinePublishInfoDetailComponent {
  private readonly auth = inject(AuthStateService);
  private readonly pipelines = inject(PipelineService);
  private readonly destroyRef = inject(DestroyRef);

  publishInfo = model.required<AppPublishInfoDTO>();
  appVersionId = input<number>();
  authors = input<AuthorDto[]>([]);
  readonly rescanning = signal(false);
  readonly canRescan = computed(() => {
    const username = this.auth.userProfile()?.username;
    return !!username && !!this.appVersionId() && !!this.publishInfo().imageName
      && this.authors().some(author => author.keycloakId === username);
  });

  rescan(): void {
    if (!this.canRescan() || this.rescanning()) return;
    this.rescanning.set(true);
    this.pipelines.create({
      pipelineType: PipelineType.APP,
      runMode: PipelineRunMode.SCAN_ONLY,
      appVersionId: this.appVersionId(),
      autoStart: true,
    }).pipe(
      switchMap(pipeline => this.pipelines.stream(pipeline.id).pipe(startWith(pipeline))),
      takeWhile(pipeline => pipeline.pipelineStatus === PipelineStatus.PENDING
        || pipeline.pipelineStatus === PipelineStatus.RUNNING, true),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.rescanning.set(false)),
    ).subscribe({
      next: pipeline => {
        const result = pipeline.publishInfo?.vulnerabilityScanResult;
        if (result) {
          this.publishInfo.update(info => ({...info, vulnerabilityScanResult: result}));
        }
      },
      error: () => { /* PipelineService displays the error. */
      },
    });
  }

  readonly vulnTotal = computed(() => {
    const s = this.publishInfo().vulnerabilityScanResult?.summary;
    if (!s) return 0;
    return (s.critical ?? 0) + (s.high ?? 0) + (s.medium ?? 0) + (s.low ?? 0) + (s.unknown ?? 0);
  });

  readonly vulnUnknown = computed(() => {
    return !this.publishInfo().vulnerabilityScanResult?.summary;
  });

  readonly sastTotal = computed(() => {
    const summary = this.publishInfo().sastScanResult?.summary;
    return summary ? summary.error + summary.warning + summary.info + summary.unknown : 0;
  });

  readonly malwareUnknown = computed(() => {
    const r = this.publishInfo().malwareScanResult;
    return !r || (!r.success && r.infectedCount === 0);
  });

  readonly malwareDisplayedColumns: string[] = ['file', 'signature'];

  trackByStr = (_: number, v: string) => v;
  trackByFinding = (_: number, f: MalwareFindingDTO) => `${f.filePath}__${f.signature ?? ''}`;


  copy(text?: string | null) {
    if (!text) return;
    // safe, best-effort (no error throwing)
    navigator?.clipboard?.writeText(text).catch(() => void 0);
  }

  toKeyValueList(obj: Record<string, any>): Array<{ key: string; value: any }> {
    return Object.entries(obj).map(([key, value]) => ({
      key,
      value: value,
    }));
  }

  getValue(obj: any, key: string): string {
    if (!obj) return "";
    return obj[key];
  }

  protected readonly pipelineStatusToBadgeStatus = pipelineStatusToBadgeStatus;
}

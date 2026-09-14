import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
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
import {KvComponent} from "@shared-lib/components/kv/kv.component";

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
    KvComponent],
  templateUrl: './pipeline-publish-info-detail.component.html',
  styleUrl: './pipeline-publish-info-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelinePublishInfoDetailComponent {
  publishInfo = input.required<AppPublishInfoDTO>();

  readonly vulnTotal = computed(() => {
    const s = this.publishInfo().vulnerabilityScanResult?.summary;
    if (!s) return 0;
    return (s.critical ?? 0) + (s.high ?? 0) + (s.medium ?? 0) + (s.low ?? 0) + (s.unknown ?? 0);
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

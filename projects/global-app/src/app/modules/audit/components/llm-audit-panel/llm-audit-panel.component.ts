import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked
} from '@angular/core';
import {DatePipe} from "@angular/common";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Subscription, timer} from "rxjs";
import {switchMap} from "rxjs/operators";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatTooltipModule} from "@angular/material/tooltip";
import {BadgeColor, BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {LlmAuditService} from "../../service/llm-audit.service";
import {LlmAuditDTO, LlmAuditQuotaDTO, LlmAuditSeverity, LlmAuditVerdict} from "../../dto/llm-audit";

interface VerdictView {
  label: string;
  color: BadgeColor;
  icon: string;
  headline: string;
}

const VERDICTS: Record<LlmAuditVerdict, VerdictView> = {
  SAFE: {label: 'Safe', color: 'GREEN', icon: 'verified_user', headline: 'No security or privacy risks found'},
  SAFE_WITH_CONCERNS: {
    label: 'Safe with concerns', color: 'ORANGE', icon: 'gpp_maybe',
    headline: 'Usable, but some points need attention'
  },
  UNSAFE: {label: 'Unsafe', color: 'RED', icon: 'gpp_bad', headline: 'Risks for patient data or the site were found'},
  INCONCLUSIVE: {label: 'Inconclusive', color: 'GRAY', icon: 'help', headline: 'Not enough information for a verdict'},
};

const SEVERITY_COLORS: Record<LlmAuditSeverity, BadgeColor> = {
  CRITICAL: 'RED',
  HIGH: 'RED',
  MEDIUM: 'ORANGE',
  LOW: 'BLUE',
  INFO: 'GRAY',
};

const POLL_MS = 5000;

@Component({
  selector: 'app-llm-audit-panel',
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTooltipModule,
    BadgeComponent,
  ],
  templateUrl: './llm-audit-panel.component.html',
  styleUrl: './llm-audit-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LlmAuditPanelComponent {
  private readonly service = inject(LlmAuditService);
  private readonly authState = inject(AuthStateService);
  private readonly destroyRef = inject(DestroyRef);

  appVersionId = input.required<number>();

  audit = signal<LlmAuditDTO | null>(null);
  quota = signal<LlmAuditQuotaDTO | null>(null);
  loading = signal<boolean>(true);
  requesting = signal<boolean>(false);

  isAdmin = this.authState.isAdmin;

  report = computed(() => this.audit()?.report ?? null);
  active = computed(() => ['PENDING', 'RUNNING'].includes(this.audit()?.status ?? ''));
  verdict = computed(() => {
    const verdict = this.audit()?.verdict;
    return verdict ? VERDICTS[verdict] : null;
  });

  canRequest = computed(() => {
    const quota = this.quota();
    return !!quota?.enabled && !this.active() && !this.requesting()
      && (quota.unlimited || quota.remaining > 0);
  });

  quotaHint = computed(() => {
    const quota = this.quota();
    if (!quota) return '';
    if (!quota.enabled) return 'AI audits are disabled on this platform.';
    if (quota.unlimited) return 'No request limit for admins.';
    if (quota.remaining > 0) return `${quota.remaining} of ${quota.limit} AI audit requests left in the last 24 hours.`;
    return 'Request limit reached for the last 24 hours.';
  });

  private poll?: Subscription;

  constructor() {
    effect(() => {
      const id = this.appVersionId();
      untracked(() => this.load(id));
    });
    this.destroyRef.onDestroy(() => this.poll?.unsubscribe());
  }

  requestAudit(force = false): void {
    this.requesting.set(true);
    this.service.request(this.appVersionId(), force)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: audit => {
          this.audit.set(audit);
          this.requesting.set(false);
          this.loadQuota();
          this.pollWhileActive();
        },
        error: () => {
          this.requesting.set(false);
          this.loadQuota();
        },
      });
  }

  severityColor(severity: LlmAuditSeverity | null | undefined): BadgeColor {
    return severity ? SEVERITY_COLORS[severity] : 'GRAY';
  }

  label(value: string | null | undefined): string {
    if (!value) return '';
    const text = value.replace(/_/g, ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  location(filePath?: string | null, line?: number | null): string {
    if (!filePath) return '';
    return line ? `${filePath}:${line}` : filePath;
  }

  private load(id: number): void {
    this.poll?.unsubscribe();
    this.loading.set(true);
    this.audit.set(null);
    this.service.latest(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: audit => {
          this.audit.set(audit ?? null);
          this.loading.set(false);
          this.pollWhileActive();
        },
        error: () => this.loading.set(false),
      });
    this.loadQuota();
  }

  private loadQuota(): void {
    this.service.quota()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({next: quota => this.quota.set(quota), error: () => this.quota.set(null)});
  }

  private pollWhileActive(): void {
    this.poll?.unsubscribe();
    if (!this.active()) return;
    const id = this.appVersionId();
    this.poll = timer(POLL_MS, POLL_MS)
      .pipe(switchMap(() => this.service.latest(id)))
      .subscribe(audit => {
        this.audit.set(audit ?? null);
        if (!this.active()) {
          this.poll?.unsubscribe();
        }
      });
  }
}

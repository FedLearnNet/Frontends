import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Store} from '@ngrx/store';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';

import {HeaderComponent} from "@shared-lib/components/header/header.component";
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {selectAuditError, selectAuditsByVersionId, selectAuditSelectedLoading} from "../../service/audit.selectors";
import {AppVersionDto} from "@shared-lib/modules/store/dto/app-version";
import {AppPublishInfoDTO} from "@shared-lib/modules/store/dto/publish-info";
import {ToolAuditCreateDTO, ToolAuditDTO} from "../../dto/audit";
import {AuditActions} from "../../service/audit.actions";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";
import {
  PipelinePublishInfoDetailComponent
} from "../../../pipeline/components/pipeline-publish-info-detail/pipeline-publish-info-detail.component";
import {KvComponent} from "@shared-lib/components/kv/kv.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";


type Decision = 'ACCEPT' | 'REJECT';

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatTooltipModule,
    ErrorCardComponent,
    PipelinePublishInfoDetailComponent,
    KvComponent,
    BadgeComponent,
    RouterLink,
  ],
  templateUrl: './audit-detail.component.html',
  styleUrl: './audit-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditDetailComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  auditCombination = this.store.selectSignal(selectAuditsByVersionId);

  loading = this.store.selectSignal(selectAuditSelectedLoading);
  error = this.store.selectSignal(selectAuditError);

  audit = computed(() => this.auditCombination()?.audit);
  appDetail = computed(() => this.auditCombination()?.appDetail);

  editMode = signal<boolean>(false);

  latestVersion = computed<AppVersionDto | null>(() => {
    const app = this.appDetail();
    if (!app?.versions?.length) return null;
    const byId = app.versions.find(v => v.id === app.latestVersionId);
    return byId ?? app.versions[0] ?? null;
  });

  publishInfo = computed<AppPublishInfoDTO | null>(() => {
    const app = this.appDetail();
    return app?.publishInfo ?? null;
  });

  vulnSummary = computed(() => this.publishInfo()?.vulnerabilityScanResult?.summary ?? null);
  malwareSummary = computed(() => this.publishInfo()?.malwareScanResult ?? null);

  activeAppVersionId = computed<number | null>(() => {
    const app = this.appDetail();
    return app?.latestVersionId ?? null;
  });

  latestDecision = computed<Decision | null | undefined>(() => this.audit()?.decision);

  latestReason = computed<string | null | undefined>(() => this.audit()?.reason);

  internetRisk = computed(() => {
    const app = this.appDetail();
    const v = this.latestVersion();
    return !!(v?.needsInternetAccess ?? app?.needsInternetAccess);
  });

  hostNetworkRisk = computed(() => {
    const app = this.appDetail();
    const v = this.latestVersion();
    return !!(v?.needsHostAccess ?? app?.needsHostAccess);
  });

  form = new FormGroup({
    decision: new FormControl<Decision | null>(null, {validators: [Validators.required]}),
    reason: new FormControl<string>('', {nonNullable: true}),
  });

  constructor() {
    // Dynamic validation: reason required for REJECT
    this.form.controls.decision.valueChanges.subscribe(decision => {
      const reasonCtrl = this.form.controls.reason;
      if (decision === 'REJECT') {
        reasonCtrl.setValidators([Validators.required, Validators.minLength(8)]);
      } else {
        reasonCtrl.clearValidators();
      }
      reasonCtrl.updateValueAndValidity({emitEvent: false});
    });
  }

  onToggleEdit(): void {
    const next = !this.editMode();
    this.editMode.set(next);

    if (next) {
      // prefill with latest decision if present
      const d = this.latestDecision();
      const r = this.latestReason();
      this.form.patchValue({decision: d, reason: r ?? ''});
    }
  }

  onSubmitDecision(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const appVersionId = this.activeAppVersionId();
    if (appVersionId == null) return;

    const dto: ToolAuditCreateDTO = {
      appVersionId,
      decision: this.form.value.decision as any,
      reason: (this.form.value.reason ?? '').trim(),
    };

    this.store.dispatch(AuditActions.create({dto}));
    this.editMode.set(false);
  }

  trackByVersion = (_: number, v: AppVersionDto) => v.id;
  trackByAudit = (_: number, a: ToolAuditDTO) => a.id ?? `${a.appVersionId}-${a.createdAt ?? a.updatedAt ?? _}`;
}

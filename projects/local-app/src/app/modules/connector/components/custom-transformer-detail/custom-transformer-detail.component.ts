import {Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, viewChild} from '@angular/core';
import {DatePipe, Location} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {filter, finalize, Subscription, switchMap} from 'rxjs';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material/dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatTooltip} from '@angular/material/tooltip';
import CodeMirror from 'codemirror';
import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {StatusBadgeComponent} from '@shared-lib/components/status-badge/status-badge.component';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {ConfirmDialogComponent} from '@shared-lib/components/confirm-dialog/confirm-dialog.component';
import {PipelineStepsComponent} from '@shared-lib/modules/pipeline/components/pipeline-steps/pipeline-steps.component';
import {PipelineStatus} from '@shared-lib/modules/pipeline/dto/pipeline';
import {codeTransformerBadge, CodeTransformerDTO, CodeTransformerStatus} from '../../dto/code-transformer';
import {ConnectorCodeTransformerService} from '../../services/connector-code-transformer.service';
import {modeIcon, modeLabelKey} from '../manage-connector/components/function/tool-list-item/transformer-mode';

const MODES: Record<string, string> = {py: 'python', json: 'application/json', yml: 'yaml'};

@Component({
  selector: 'app-custom-transformer-detail',
  templateUrl: './custom-transformer-detail.component.html',
  styleUrl: './custom-transformer-detail.component.scss',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    MatButtonToggleModule,
    MatTooltip,
    HeaderComponent,
    PageWrapperComponent,
    EmptyStateComponent,
    BtnComponent,
    KvComponent,
    BadgeComponent,
    StatusBadgeComponent,
    ErrorCardComponent,
    PipelineStepsComponent,
  ],
})
export class CustomTransformerDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  private readonly service = inject(ConnectorCodeTransformerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly codeHost = viewChild<ElementRef<HTMLElement>>('code');
  private editor?: CodeMirror.Editor;
  private buildSubscription?: Subscription;

  readonly id = Number(this.route.snapshot.paramMap.get('customId'));
  readonly transformer = signal<CodeTransformerDTO | null>(null);
  readonly loading = signal(false);
  readonly error = signal<object | string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly files = computed(() => Object.keys(this.transformer()?.files ?? {}).sort());
  readonly file = signal('code_transformer.py');
  readonly build = computed(() => this.transformer()?.pipeline ?? null);
  readonly goal = computed(() => {
    const goal = this.transformer()?.goal;
    return goal ? [goal.type, ...(goal.validations ?? []).map(rule => `${rule.name} ${rule.validator}`)].join(' · ') : '';
  });
  readonly badge = codeTransformerBadge;
  readonly modeIcon = modeIcon;
  readonly modeLabelKey = modeLabelKey;

  constructor() {
    effect(() => {
      const host = this.codeHost()?.nativeElement;
      const content = this.transformer()?.files?.[this.file()];
      if (!host || content === undefined) {
        return;
      }
      this.editor ??= CodeMirror(host, {lineNumbers: true, readOnly: true, viewportMargin: Infinity});
      this.editor.setOption('mode', MODES[this.file().split('.').pop() ?? ''] ?? null);
      this.editor.setValue(content);
    });
  }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.get(this.id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: transformer => this.show(transformer),
      error: error => this.error.set(error),
    });
  }

  rebuild(): void {
    this.actionError.set(null);
    this.service.build(this.id).subscribe({
      next: transformer => this.show(transformer),
      error: err => this.actionError.set(err?.error?.detail ?? err?.message),
    });
  }

  delete(): void {
    const transformer = this.transformer()!;
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('CUSTOM_TRANSFORMERS.DELETE_TITLE'),
        message: this.translate.instant('CUSTOM_TRANSFORMERS.DELETE_MESSAGE', {name: transformer.name}),
        dismissButtonText: this.translate.instant('BUTTON.CANCEL'),
        confirmButtonText: this.translate.instant('BUTTON.DELETE'),
      },
    }).afterClosed().pipe(
      filter(confirmed => !!confirmed),
      switchMap(() => this.service.delete(transformer.id)),
    ).subscribe({
      next: () => this.location.back(),
      error: err => this.actionError.set(err?.error?.detail ?? err?.error ?? err?.message),
    });
  }

  private show(transformer: CodeTransformerDTO): void {
    this.transformer.set(transformer);
    this.buildSubscription?.unsubscribe();
    if (transformer.status !== CodeTransformerStatus.BUILDING) {
      return;
    }
    this.buildSubscription = this.service.buildUpdates(transformer.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(build => {
      this.transformer.update(current => current && {...current, pipeline: build});
      if (build.pipelineStatus === PipelineStatus.SUCCESS || build.pipelineStatus === PipelineStatus.FAILED) {
        this.buildSubscription?.unsubscribe();
        this.service.get(transformer.id).subscribe(updated => this.transformer.set(updated));
      }
    });
  }
}

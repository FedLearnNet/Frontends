import {Component, computed, inject, input, OnDestroy, output, signal} from '@angular/core';
import {Subscription} from 'rxjs';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {EmptyStateComponent} from '@shared-lib/modules/app-execution/components/empty-state/empty-state.component';
import {ErrorCardComponent} from '@shared-lib/components/error-card/error-card.component';
import {
  StatusBadeType,
  StatusBadgeComponent
} from '@shared-lib/components/status-badge/status-badge.component';
import {ConnectorAppBasedTransformerService} from '../../../../../services/connector-app-based-transformer.service';
import {ConnectorPreviewService} from '../../../../../services/connector-preview.service';
import {AppTransformerPreviewStreamDTO} from '../../../../../dto/connector-app-based-transformer';
import {FunctionsDetailDTO} from '../../../../../dto/function';
import {PreviewStageDTO} from '../../../../../dto/preview';
import {ConnectorDTO} from '../../../../../dto/connector';
import {RunStatusTypes} from '../../../../../../../../../../global-app/src/app/modules/tool-development/dto/test-run';

@Component({
  selector: 'app-app-based-transformer',
  imports: [
    TranslatePipe,
    MatIcon,
    MatTooltip,
    BtnComponent,
    KvComponent,
    EmptyStateComponent,
    ErrorCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './app-based-transformer.component.html',
  styleUrl: './app-based-transformer.component.scss',
})
export class AppBasedTransformerComponent implements OnDestroy {
  private readonly transformerService = inject(ConnectorAppBasedTransformerService);
  private readonly previewService = inject(ConnectorPreviewService);
  private readonly translate = inject(TranslateService);

  config = input.required<ConnectorDTO>();
  transformers = input.required<Map<string, FunctionsDetailDTO>>();
  cohortId = input.required<number>();
  stepIndex = input.required<number>();
  transformer = input<FunctionsDetailDTO | undefined>();
  stage = input<PreviewStageDTO | undefined>();

  finished = output<void>();

  openBlockingStep = output<number>();

  readonly running = signal(false);
  readonly last = signal<AppTransformerPreviewStreamDTO | null>(null);
  readonly error = signal<string | null>(null);

  readonly appImage = computed(() => this.transformer()?.appImage ?? '');

  readonly appName = computed(() => {
    const image = this.appImage();
    return image ? image.substring(image.lastIndexOf('/') + 1) : '';
  });

  readonly transformerName = computed(() => this.transformer()?.methodName ?? '');

  readonly title = computed(() =>
    this.transformerName() || this.appName() || `${this.stepIndex()}`);

  readonly blockedByStep = computed(() => this.stage()?.blockedByStep ?? null);


  readonly rowCount = computed(() => this.last()?.rowCount ?? this.stage()?.rowCount ?? null);
  readonly hasResult = computed(() => !!this.stage() && !this.stage()!.requiresRun);

  readonly awaitingRun = computed(() => !this.hasResult() || this.blockedByStep() !== null);
  readonly lastLog = computed(() => this.last()?.lastLog ?? null);
  readonly badge = computed<StatusBadeType>(() => {
    switch (this.last()?.status) {
      case RunStatusTypes.ERROR:
        return 'FAILED';
      case RunStatusTypes.FINISHED:
        return 'SUCCESS';
      case RunStatusTypes.STOPPED:
        return 'STOPPED';
      case RunStatusTypes.RUNNING:
      case RunStatusTypes.STARTED:
      case RunStatusTypes.INITIALIZED:
        return 'RUNNING';
      default:
        return this.running() ? 'RUNNING' : 'PENDING';
    }
  });

  private subscription?: Subscription;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  start(): void {
    if (this.running()) {
      return;
    }
    this.subscription?.unsubscribe();
    this.last.set(null);
    this.error.set(null);
    this.running.set(true);

    const request = {
      config: this.previewService.buildConfigDTO(this.config(), this.transformers(), this.cohortId()),
      stepIndex: this.stepIndex(),
    };

    this.subscription = this.transformerService.runStep(request).subscribe({
      next: message => {
        this.last.set(message);
        if (message.lastError) {
          this.error.set(message.lastError);
        }
      },
      error: err => {
        this.running.set(false);
        this.error.set(err?.error?.detail ?? err?.message
          ?? this.translate.instant('APP_TRANSFORMER.FAILED'));
      },
      complete: () => {
        this.running.set(false);
        if (!this.error()) {
          this.finished.emit();
        }
      },
    });
  }
}

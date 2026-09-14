import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
  Signal
} from '@angular/core';
import {Store} from "@ngrx/store";
import {
  ModelWorkflowChatMessageType,
  ModelWorkflowChatWrapperDTO,
  ModelWorkflowMessageDto,
  UiActionDto,
  UiActionType
} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {
  ModelResultCardComponent
} from "@shared-lib/modules/app-execution/components/model-result-card/model-result-card.component";
import {DataAnalysisResultDTO, DataAnalysisRunModesEnum} from "@shared-lib/modules/app-execution/dto/prediction";
import {AiActionService} from "@shared-lib/modules/app-execution/service/ai-action.service";
import {
  selectSelectedDataAnalysis
} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {
  ChatMessageBubbleComponent
} from "@shared-lib/modules/chat/components/chat-message-bubble/chat-message-bubble.component";
import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {ComponentPortal} from "@angular/cdk/portal";
import {
  DataAnalysisChatHoverCardComponent
} from "@shared-lib/modules/app-execution/components/data-analysis-chat-hover-card/data-analysis-chat-hover-card.component";

@Component({
  selector: 'lib-model-workflow-chat-thread',
  imports: [
    ModelResultCardComponent,
    ChatMessageBubbleComponent
  ],
  templateUrl: './model-workflow-chat-thread.component.html',
  styleUrl: './model-workflow-chat-thread.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModelWorkflowChatThreadComponent implements OnInit {
  private readonly store: Store = inject(Store);
  private readonly aiAction: AiActionService = inject(AiActionService);
  private readonly overlay: Overlay = inject(Overlay);

  workflowId = input.required<number>();

  dataAnalysisState = this.store.selectSignal(selectSelectedDataAnalysis);
  wf = computed(() => this.dataAnalysisState()?.detail);

  messages: Signal<ModelWorkflowChatWrapperDTO[]> = computed(() => {
    return this.wf()?.messages ?? [];
  });

  readonly hovered = signal<{ dto: UiActionDto; origin: HTMLElement } | null>(null);

  private overlayRef: OverlayRef | null = null;

  constructor() {
    effect(() => {
      const h = this.hovered();
      if (!h) {
        this.onBubbleHoverLeave();
        return;
      }
      this.ensureHoverOverlay(h.origin, h.dto);
    });
  }

  ngOnInit(): void {
    this.store.dispatch(DataAnalysisActions.chatConnect({dataAnalysisId: this.workflowId()}));
    queueMicrotask(() => this.scrollBottom());
  }

  isChat(m: ModelWorkflowChatWrapperDTO) {
    return m.type === ModelWorkflowChatMessageType.CHAT_MESSAGE;
  }

  getAsChat(m: ModelWorkflowChatWrapperDTO): ModelWorkflowMessageDto {
    return m.message as ModelWorkflowMessageDto
  }

  isPrediction(m: ModelWorkflowChatWrapperDTO) {
    return m.type === ModelWorkflowChatMessageType.PREDICTION ||
      m.type === ModelWorkflowChatMessageType.WORKFLOW_PREDICTION;
  }

  getAsPrediction(m: ModelWorkflowChatWrapperDTO): DataAnalysisResultDTO {
    if (m.type === ModelWorkflowChatMessageType.PREDICTION) {
      return {
        ...m.message,
        runMode: DataAnalysisRunModesEnum.PREDICTION
      } as DataAnalysisResultDTO;
    }
    return {
      ...(m.message as DataAnalysisResultDTO),
      runMode: DataAnalysisRunModesEnum.WORKFLOW
    };
  }

  onBubbleClick(evt: MouseEvent) {
    this.onBubbleHoverLeave();
    const el = evt.target as HTMLElement;
    const anchor = el.closest('a.app-action') as HTMLAnchorElement | null;
    if (!anchor) return;
    evt.preventDefault();

    const {kind, action, id} = (anchor.dataset as any);
    if (!kind || !action || !id) return;
    this.aiAction.handleViaButton(kind, action, id);
  }
  onActionClick(uiAction: UiActionDto) {
    this.aiAction.handle(uiAction);
  }

  onBubbleHover(evt: MouseEvent) {
    const el = evt.target as HTMLElement;
    const anchor = el.closest('a.app-action') as HTMLAnchorElement | null;
    if (!anchor) return;

    const {kind, action, id} = anchor.dataset as any;
    if (!kind || !action || !id) return;

    const dto: UiActionDto = this.aiAction.handleViaHover(kind, action, id);
    if (dto.action !== UiActionType.DETAIL) return;
    this.hovered.set({dto: dto, origin: el});
  }

  onBubbleHoverLeave() {
    this.hovered.set(null);
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private ensureHoverOverlay(origin: HTMLElement, dto: UiActionDto) {

    if (!this.overlayRef) {
      const positionStrategy = this.overlay.position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(false)
        .withPush(true)
        .withPositions([
          {originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 10, offsetY: 0},
          {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -10, offsetY: 0},
        ]);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        hasBackdrop: false,
        panelClass: 'ai-hover-panel'
      });

      const portal = new ComponentPortal(DataAnalysisChatHoverCardComponent);
      const compRef = this.overlayRef.attach(portal);
      compRef.setInput('action', dto);
    } else {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  private scrollBottom() {
    const host = document.querySelector('lib-chat-thread');
    if (!host) return;
    (host as HTMLElement).scrollTop = (host as HTMLElement).scrollHeight;
  }
}

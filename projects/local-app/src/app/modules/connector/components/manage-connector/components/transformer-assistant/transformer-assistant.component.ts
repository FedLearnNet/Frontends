import {Component, computed, effect, ElementRef, inject, input, OnDestroy, OnInit, output, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {provideMarkdown} from 'ngx-markdown';
import {BtnComponent} from '@shared-lib/components/btn/btn.component';
import {BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {ChatMessageBubbleComponent} from '@shared-lib/modules/chat/components/chat-message-bubble/chat-message-bubble.component';
import {ChatInputComponent} from '@shared-lib/modules/chat/components/chat-input/chat-input.component';
import {HumanInTheLoopDTO, HumanInTheLoopType} from '@shared-lib/modules/app-execution/dto/chat';
import {ConnectorDTO} from '../../../../dto/connector';
import {TransformerAssistantActions} from '../../../../store/transformer-assistant/transformer-assistant.actions';
import {
  TransformerAssistantStatus,
  transformerAssistantFeature
} from '../../../../store/transformer-assistant/transformer-assistant.reducer';
import {TransformerAssistantProgressComponent} from '../transformer-assistant-progress/transformer-assistant-progress.component';
import {TransformerAssistantQuestionComponent} from '../transformer-assistant-question/transformer-assistant-question.component';

const STATUS_LABELS: Partial<Record<TransformerAssistantStatus, string>> = {
  RUNNING: 'DIALOG.TRANSFORMER_ASSISTANT.RUNNING',
  DONE: 'DIALOG.TRANSFORMER_ASSISTANT.DONE',
  STOPPED: 'DIALOG.TRANSFORMER_ASSISTANT.STOPPED',
  ERROR: 'DIALOG.TRANSFORMER_ASSISTANT.FAILED',
};

@Component({
  selector: 'app-transformer-assistant',
  standalone: true,
  imports: [
    MatIcon,
    TranslatePipe,
    TransformerAssistantProgressComponent,
    TransformerAssistantQuestionComponent,
    BtnComponent,
    BadgeComponent,
    ChatMessageBubbleComponent,
    ChatInputComponent,
  ],
  providers: [provideMarkdown()],
  templateUrl: './transformer-assistant.component.html',
  styleUrl: './transformer-assistant.component.scss',
})
export class TransformerAssistantComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly stream = viewChild<ElementRef<HTMLElement>>('stream');

  connector = input.required<ConnectorDTO>();
  /** Rows of the file, for example values next to the columns of a question. */
  sampleRows = input<Record<string, unknown>[]>([]);
  applied = output<ConnectorDTO>();
  cancelled = output<void>();

  readonly status = this.store.selectSignal(transformerAssistantFeature.selectStatus);
  readonly error = this.store.selectSignal(transformerAssistantFeature.selectError);
  readonly messages = this.store.selectSignal(transformerAssistantFeature.selectMessages);
  readonly nodes = this.store.selectSignal(transformerAssistantFeature.selectNodes);
  readonly foundNodes = this.store.selectSignal(transformerAssistantFeature.selectFoundNodes);
  readonly progress = this.store.selectSignal(transformerAssistantFeature.selectProgress);
  readonly currentNode = this.store.selectSignal(transformerAssistantFeature.selectCurrentNode);
  readonly patientIdColumn = this.store.selectSignal(transformerAssistantFeature.selectPatientIdColumn);
  readonly pendingQuestion = this.store.selectSignal(transformerAssistantFeature.selectPendingQuestion);
  readonly pendingAgent = this.store.selectSignal(transformerAssistantFeature.selectPendingAgent);
  readonly nodesToApply = this.store.selectSignal(transformerAssistantFeature.selectNodesToApply);
  readonly excluded = this.store.selectSignal(transformerAssistantFeature.selectExcluded);
  readonly waiting = computed(() => this.status() === 'RUNNING' && this.pendingQuestion() !== null);
  private readonly appliedConnector = this.store.selectSignal(transformerAssistantFeature.selectApplied);

  readonly statusLabel = computed(() => this.waiting() ? 'DIALOG.TRANSFORMER_ASSISTANT.WAITING_STATUS' : STATUS_LABELS[this.status()]);
  /** The chat without a pending column question, which is shown as its own card below the stream. */
  readonly streamMessages = computed(() => this.messages().filter(message =>
    message.done || !message.humanInTheLoop?.some(question => !question.answer && this.isColumnQuestion(question))));

  constructor() {
    effect(() => {
      const connector = this.appliedConnector();
      if (connector) {
        this.applied.emit(connector);
      }
    });
    effect(() => {
      this.streamMessages();
      const stream = this.stream()?.nativeElement;
      if (stream) {
        setTimeout(() => stream.scrollTop = stream.scrollHeight);
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(TransformerAssistantActions.start({connector: this.connector()}));
  }

  ngOnDestroy(): void {
    this.store.dispatch(TransformerAssistantActions.reset());
  }

  isColumnQuestion(question: HumanInTheLoopDTO): boolean {
    return question.type === HumanInTheLoopType.SELECT_COLUMN || question.type === HumanInTheLoopType.SELECT_COLUMNS;
  }

  send(message: string): void {
    this.store.dispatch(TransformerAssistantActions.sendMessage({message}));
  }

  answer(columns: string[]): void {
    this.store.dispatch(TransformerAssistantActions.sendMessage({message: columns.join(', '), columns}));
  }

  toggleNode(schemaId: number): void {
    this.store.dispatch(TransformerAssistantActions.toggleNode({schemaId}));
  }

  stop(): void {
    this.store.dispatch(TransformerAssistantActions.stop());
  }

  apply(): void {
    this.store.dispatch(TransformerAssistantActions.apply());
  }

  cancel(): void {
    this.cancelled.emit();
  }
}

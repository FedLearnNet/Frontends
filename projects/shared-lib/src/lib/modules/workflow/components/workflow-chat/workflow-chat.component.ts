import {Component, inject} from '@angular/core';
import {ChatBubbleComponent} from "@shared-lib/modules/chat/components/chat-bubble/chat-bubble.component";
import {ChatInputComponent} from "@shared-lib/modules/chat/components/chat-input/chat-input.component";
import {Store} from "@ngrx/store";
import {toSignal} from "@angular/core/rxjs-interop";
import {
  selectChatError,
  selectChatMessages,
  selectConnected
} from "@shared-lib/modules/workflow/store/workflow-chat.selectors";
import {WorkflowChatActions} from "@shared-lib/modules/workflow/store/workflow-chat.actions";

@Component({
  selector: 'lib-workflow-chat',
  imports: [
    ChatBubbleComponent,
    ChatInputComponent
  ],
  templateUrl: './workflow-chat.component.html',
  styleUrl: './workflow-chat.component.scss',
})
export class WorkflowChatComponent {
  private readonly store: Store = inject(Store);

  connected = toSignal(this.store.select(selectConnected), {initialValue: false});
  error = toSignal(this.store.select(selectChatError), {initialValue: false});
  messages = toSignal(this.store.select(selectChatMessages), {initialValue: []});

  public submit(content: string) {
    this.store.dispatch(WorkflowChatActions.sendUserMessage({content}));
  }
}

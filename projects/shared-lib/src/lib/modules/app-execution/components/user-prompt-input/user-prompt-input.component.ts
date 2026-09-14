import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Store} from "@ngrx/store";
import {ChatInputComponent} from "@shared-lib/modules/chat/components/chat-input/chat-input.component";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";
import {selectChatConnected} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.selectors";


@Component({
  selector: 'lib-user-prompt-input',
  imports: [
    ChatInputComponent,
  ],
  templateUrl: './user-prompt-input.component.html',
  styleUrl: './user-prompt-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPromptInputComponent {
  private readonly store: Store = inject(Store);

  readonly allSuggestion: string[] = [
    'list models — Show available AI models',
    'recommend a model for classification on tabular data — Rank suitable models',
    'use model <id> — Add model to current workflow',
    'which model fits my workflow data — Compare data vs. model input config',
    'list files — Show workflow files',
    'analyze file <id|name> — Profile: schema, stats, missingness',
    'help — What can you do?'
  ]

  connected = this.store.selectSignal(selectChatConnected);


  public submit(content: string) {
    this.store.dispatch(DataAnalysisActions.chatSendUserMessage({content}));
  }

}

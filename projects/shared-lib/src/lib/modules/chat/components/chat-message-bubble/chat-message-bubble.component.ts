import {Component, computed, input, output} from '@angular/core';
import {BaseChatMessageDTO} from "@shared-lib/modules/app-execution/dto/chat";
import {DatePipe} from "@angular/common";
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";
import {MatIcon} from "@angular/material/icon";
import {
  ChatMessageReasoningPanelComponent
} from "@shared-lib/modules/chat/components/chat-message-reasoning-panel/chat-message-reasoning-panel.component";
import {SkeletonLoaderComponent} from "@shared-lib/components/skeleton-loader/skeleton-loader.component";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {
  ChatMessageToolPanelComponent
} from "@shared-lib/modules/chat/components/chat-message-tool-panel/chat-message-tool-panel.component";
import {
  ChatHumanInTheLoopComponent
} from "@shared-lib/modules/chat/components/chat-human-in-the-loop/chat-human-in-the-loop.component";
import {UiActionDto, UiActionType} from "@shared-lib/modules/app-execution/dto/model-workflow-chat";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'lib-chat-message-bubble',
  imports: [
    DatePipe,
    MarkdownComponent,
    MatTabGroup,
    MatTab,
    MatIcon,
    MatTabLabel,
    ChatMessageReasoningPanelComponent,
    SkeletonLoaderComponent,
    TimeBadgeComponent,
    BadgeComponent,
    ChatMessageToolPanelComponent,
    ChatHumanInTheLoopComponent,
    MatButton
  ],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './chat-message-bubble.component.html',
  styleUrl: './chat-message-bubble.component.scss',
})
export class ChatMessageBubbleComponent {
  message = input.required<BaseChatMessageDTO>();
  uiAction = input<UiActionDto | undefined>(undefined);
  messageClicked = output<MouseEvent>();
  messageHover = output<MouseEvent>();
  messageLeave = output();
  actionClicked = output<UiActionDto>();

  toolsCount = computed(() => {
    if (!this.message() || !this.message().tools) {
      return 0;
    }
    return this.message().tools
      .length;
  });

  reasoningsCount = computed(() => {
    if (!this.message() || !this.message().reasonings) {
      return 0;
    }
    return this.message().reasonings
      .length;
  });

  humanInTheLoopCount = computed(() => {
    if (!this.message() || !this.message().humanInTheLoop) {
      return 0;
    }
    return this.message().humanInTheLoop
      .length;
  });

  waitingForHumanInTheLoop = computed(() => {
    const hasHITL = this.humanInTheLoopCount() > 0;
    if (hasHITL) {
      return this.message().humanInTheLoop.filter(h => h.answer === null).length > 0;
    }
    return false;
  });

  uiActionLabel = computed(() => {
    const action = this.uiAction();
    if (!action) {
      return undefined;
    }
    if (action.label) {
      return action.label;
    }
    if (action.action === UiActionType.DETAIL) {
      return "Detail view";
    }
    if (action.action === UiActionType.ADD_TO_WORKFLOW) {
      return "Add to analysis"
    }
    return "Action";
  })


}

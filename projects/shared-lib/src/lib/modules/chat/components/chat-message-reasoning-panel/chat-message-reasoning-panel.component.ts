import {Component, input} from '@angular/core';
import {ReasoningDTO} from "@shared-lib/modules/app-execution/dto/chat";
import {MatList, MatListItem} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {TimeBadgeComponent} from "@shared-lib/components/time-badge/time-badge.component";

@Component({
  selector: 'lib-chat-message-reasoning-panel',
  imports: [
    MatListItem,
    MatIcon,
    MatList,
    TimeBadgeComponent
  ],
  templateUrl: './chat-message-reasoning-panel.component.html',
  styleUrl: './chat-message-reasoning-panel.component.scss',
})
export class ChatMessageReasoningPanelComponent {

  readonly reasonings = input.required<ReasoningDTO[]>();
}

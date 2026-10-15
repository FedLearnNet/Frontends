import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {ToolDTO} from "@shared-lib/modules/app-execution/dto/chat";
import {MatList, MatListItem} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'lib-chat-message-tool-panel',
  imports: [
    MatListItem,
    MatIcon,
    MatList
  ],
  templateUrl: './chat-message-tool-panel.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chat-message-tool-panel.component.scss',
})
export class ChatMessageToolPanelComponent {

  readonly tools = input.required<ToolDTO[]>();
}

import {Component, input, output, ChangeDetectionStrategy} from '@angular/core';
import {MarkdownComponent} from "ngx-markdown";
import {provideChatMarkdown} from "@shared-lib/modules/chat/markdown/chat-markdown-sanitizer";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'lib-chat-bubble',
  imports: [
    MarkdownComponent,
    DatePipe
  ],
  providers: [
    provideChatMarkdown(),
  ],
  templateUrl: './chat-bubble.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './chat-bubble.component.scss',
})
export class ChatBubbleComponent {
  message = input.required<string>();
  done = input.required<boolean>();
  isUserMessage = input.required<boolean>();
  createdAt = input.required<Date>();

  error = input<string>();
  statusMessage = input<string>();

  messageClicked = output<MouseEvent>();
}

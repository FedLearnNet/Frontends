import {Component, input, output} from '@angular/core';
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'lib-chat-bubble',
  imports: [
    MarkdownComponent,
    DatePipe
  ],
  providers: [
    provideMarkdown(),
  ],
  templateUrl: './chat-bubble.component.html',
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

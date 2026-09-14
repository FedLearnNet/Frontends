import {Component, computed, effect, input, output, signal} from '@angular/core';
import {MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {HumanInTheLoopDTO} from "@shared-lib/modules/app-execution/dto/chat";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'lib-chat-human-in-the-loop',
  imports: [
    MarkdownComponent,
    FormsModule
  ],
  templateUrl: './chat-human-in-the-loop.component.html',
  styleUrl: './chat-human-in-the-loop.component.scss',
  providers: [
    provideMarkdown(),
  ],
})
export class ChatHumanInTheLoopComponent {
  humanInTheLoop = input.required<HumanInTheLoopDTO>();
  response = output<string>();

  markdownQuestion = computed(() => this.humanInTheLoop().question);
  answer = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const answer = this.humanInTheLoop().answer;
      if (answer) {
        this.answer.set(answer);
      }
    })
  }
}

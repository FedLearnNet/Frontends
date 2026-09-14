import {Component, computed, effect, ElementRef, input, model, viewChild} from '@angular/core';
import {ConsoleStdOutDTO} from "../../../../../../../global-app/src/app/modules/tool-development/dto/performance";

@Component({
  selector: 'lib-console-output',
  imports: [],
  templateUrl: './console-output.component.html',
  styleUrl: './console-output.component.scss',
})
export class ConsoleOutputComponent {

  consoleRawSplitting = input<string>("\n");
  consoleRawMsg = input<string | undefined>(undefined);
  consoleStdOut = input<ConsoleStdOutDTO[]>([]);
  followConsole = model<boolean>(true);

  consoleOutput = viewChild<ElementRef<HTMLElement>>('consoleOutput');

  messages = computed(() => {

    const consoleStdOut = this.consoleStdOut().map(e => e.msg);
    const consoleRawMsg = this.consoleRawMsg()?.split(this.consoleRawSplitting()) ?? [];
    return [...consoleStdOut, ...consoleRawMsg];
  });

  msgUpdateEffect$ = effect(() => {
    if (this.messages().length === 0) return;
    if (this.followConsole()) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 0);
    }
  });

  scrollToBottom(): void {
    const element = this.consoleOutput()?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  toggleFollow(): void {
    this.followConsole.update(f => !f);
  }


}

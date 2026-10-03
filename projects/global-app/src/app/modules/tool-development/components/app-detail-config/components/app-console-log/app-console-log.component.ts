import {Component, DestroyRef, inject, input, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ControllerSocketService} from '../../../../service/testembed-socket.service';
import {ConsoleStdOutDTO} from '../../../../dto/performance';
import {ConsoleLogComponent} from '@shared-lib/modules/app-execution/components/console-log/console-log.component';

@Component({
  selector: 'app-app-console-log',
  imports: [ConsoleLogComponent],
  template: '<lib-console-log [(outputs)]="consoleOutputs" [clientConnected]="clientConnected()" [appConnected]="appConnected()"/>',
})
export class AppConsoleLogComponent implements OnInit {
  private readonly service = inject(ControllerSocketService);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientConnected = input<boolean>(false);
  readonly appConnected = input<boolean>(false);

  readonly consoleOutputs = signal<ConsoleStdOutDTO[]>([]);

  ngOnInit(): void {
    this.service
      .getClientConsole$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.consoleOutputs.update((arr) => [...arr, data]));
  }
}

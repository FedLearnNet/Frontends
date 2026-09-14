import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ControllerSocketService } from '../../../../service/testembed-socket.service';
import { ConsoleStdOutDTO } from '../../../../dto/performance';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { ConsoleOutputComponent } from '@shared-lib/modules/app-execution/components/console-output/console-output.component';

@Component({
  selector: 'app-app-console-log',
  imports: [
    MatTooltipModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    TranslatePipe,
    ConsoleOutputComponent,
  ],
  templateUrl: './app-console-log.component.html',
  styleUrl: './app-console-log.component.scss',
})
export class AppConsoleLogComponent implements OnInit {
  private readonly service = inject(ControllerSocketService);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientConnected = input<boolean>(false);
  readonly appConnected = input<boolean>(false);

  readonly consoleOutputs = signal<ConsoleStdOutDTO[]>([]);
  readonly dynamicHeight = signal<number>(60);
  readonly isVisible = signal<boolean>(false);
  readonly followConsole = signal<boolean>(true);

  ngOnInit(): void {
    this.service
      .getClientConsole$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.consoleOutputs.update((arr) => [...arr, data]);
      });
  }

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isVisible()) return;

    const innerHeight = window.innerHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      this.dynamicHeight.set(innerHeight - moveEvent.clientY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  toggleConsole(): void {
    const nextVisible = !this.isVisible();
    this.isVisible.set(nextVisible);
    this.dynamicHeight.set(nextVisible ? 120 : 60);
  }

  deleteOutputs(): void {
    this.consoleOutputs.set([]);
  }

  toggleFollow(): void {
    this.followConsole.update((v) => !v);
  }
}

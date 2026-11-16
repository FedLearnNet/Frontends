import {Component, input, model, signal} from '@angular/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {ConsoleOutputComponent} from '../console-output/console-output.component';
import {ConsoleStdOutDTO} from '../../dto/console';

const CLOSED_HEIGHT = 60;
const OPEN_HEIGHT = 120;
const INLINE_OPEN_HEIGHT = 280;

@Component({
  selector: 'lib-console-log',
  imports: [MatTooltipModule, MatIconModule, MatToolbarModule, MatButtonModule, TranslatePipe, ConsoleOutputComponent],
  templateUrl: './console-log.component.html',
  styleUrl: './console-log.component.scss',
})
export class ConsoleLogComponent {
  readonly outputs = model<ConsoleStdOutDTO[]>([]);
  readonly clientConnected = input<boolean>(false);
  readonly appConnected = input<boolean>(false);
  readonly docked = input<boolean>(true);
  readonly title = input<string>();

  readonly dynamicHeight = signal<number>(CLOSED_HEIGHT);
  readonly isVisible = signal<boolean>(false);
  readonly followConsole = signal<boolean>(true);

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isVisible()) return;

    const handleMouseMove = (moveEvent: MouseEvent) => this.dynamicHeight.set(window.innerHeight - moveEvent.clientY);
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
    this.dynamicHeight.set(!nextVisible ? CLOSED_HEIGHT : this.docked() ? OPEN_HEIGHT : INLINE_OPEN_HEIGHT);
  }

  deleteOutputs(): void {
    this.outputs.set([]);
  }

  toggleFollow(): void {
    this.followConsole.update((v) => !v);
  }
}

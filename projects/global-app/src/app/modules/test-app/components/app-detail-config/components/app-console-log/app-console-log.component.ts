import {Component, ElementRef, inject, Input, OnInit, ViewChild} from '@angular/core';
import {ControllerSocketService} from "../../../../service/testembed-socket.service";
import {MatTooltipModule} from "@angular/material/tooltip";
import {EMPTY, Observable} from "rxjs";
import {ConsoleStdOutDTO} from "../../../../dto/performance";
import {MatIconModule} from "@angular/material/icon";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-app-console-log',
  standalone: true,
  imports: [MatTooltipModule, MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: './app-console-log.component.html',
  styleUrl: './app-console-log.component.scss'
})
export class AppConsoleLogComponent implements OnInit {
  private readonly service: ControllerSocketService = inject(ControllerSocketService);

  @Input() clientConnected: boolean = false;
  @Input() appConnected: boolean = false;

  @ViewChild('consoleOutput') consoleOutput: ElementRef | undefined;

  consoleOutputs: ConsoleStdOutDTO[] = [];
  dynamicHeight: number = 60;
  isVisible: boolean = false;
  followConsole: boolean = true;

  ngOnInit(): void {
    this.service.getClientConsole$().subscribe((data) => {
      this.consoleOutputs.push(data);
      if (this.followConsole) {
        setTimeout(() => {
          this.scrollToBottom();
        }, 0);
      }
    });
  }

  scrollToBottom(): void {
    const element = this.consoleOutput?.nativeElement;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    if (!this.isVisible) {
      return;
    }
    const innerHeight = window.innerHeight;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      this.dynamicHeight = innerHeight - moveEvent.clientY;
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  toggleConsole(): void {
    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      this.dynamicHeight = 120;
    } else {
      this.dynamicHeight = 60;
    }
  }

  deleteOutputs(): void {
    this.consoleOutputs = [];
  }

  toggleFollow(): void {
    this.followConsole = !this.followConsole;
  }
}

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AppDto} from "../../dto/app";

@Component({
  selector: 'app-app-card-mini',
  templateUrl: './app-card-mini.component.html',
  styleUrl: './app-card-mini.component.scss'
})
export class AppCardMiniComponent {
  @Input() app?: AppDto;
}

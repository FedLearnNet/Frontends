import {Component, input} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {ErrorCardComponent} from "@shared-lib/components/error-card/error-card.component";

@Component({
  selector: 'app-start-app-warning',
  imports: [
    MatIcon,
    BadgeComponent,
    ErrorCardComponent
  ],
  templateUrl: './start-app-warning.component.html',
  styleUrl: './start-app-warning.component.scss',
})
export class StartAppWarningComponent {
  readonly uiConnected = input<boolean>(true);

}

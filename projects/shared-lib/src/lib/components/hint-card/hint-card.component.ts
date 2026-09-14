import {Component, input, output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'lib-hint-card',
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './hint-card.component.html',
  styleUrl: './hint-card.component.scss'
})
export class HintCardComponent {
  hintButtonText = input<string>();
  hintLink = input<string>();
  hintClicked = output<boolean>();

  onHintClick(): void {
    if (!this.hintButtonText()) {
      return;
    }
    this.hintClicked.emit(true);
  }
}

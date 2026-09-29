import {Component, input, output, ChangeDetectionStrategy} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {BtnComponent} from "@shared-lib/components/btn/btn.component";

@Component({
  selector: 'lib-sse-refresh-btn',
  imports: [
    MatIcon,
    MatIconButton,
    BtnComponent
  ],
  templateUrl: './sse-refresh-btn.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sse-refresh-btn.component.scss'
})
export class SseRefreshBtnComponent {
  streaming = input<boolean | undefined>(false);
  refreshing = input<boolean | undefined>(false);
  showBtn = input<boolean | undefined>(true);
  btnText = input<string | undefined>("Refresh");

  clicked = output<void>();

  onBtnClick() {
    this.clicked.emit();
  }
}

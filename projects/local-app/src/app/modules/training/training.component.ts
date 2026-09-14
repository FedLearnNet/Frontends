import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
  imports: [
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TrainingComponent {
}

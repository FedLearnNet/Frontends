import {Component, ChangeDetectionStrategy} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-data-review',
  templateUrl: './data-review.component.html',
  styleUrl: './data-review.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    RouterOutlet
  ]
})
export class DataReviewComponent {
}

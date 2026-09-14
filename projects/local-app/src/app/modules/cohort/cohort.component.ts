import {Component, ViewEncapsulation} from '@angular/core';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-cohort',
  templateUrl: './cohort.component.html',
  styleUrls: ['./cohort.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    RouterOutlet
  ]
})
export class CohortComponent {

}
